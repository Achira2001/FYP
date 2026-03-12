import User from '../models/User.js';
import Query from '../models/Query.js';
import Medication from '../models/Medication.js';
import Notification from '../models/Notification.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { twilioClient, transporter } from '../services/notificationService.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Generate random password
const generatePassword = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Create or get doctor account
const createOrGetDoctorAccount = async (doctorEmail, doctorName, doctorPhone) => {
  let doctor = await User.findOne({ email: doctorEmail, role: 'doctor' });

  if (doctor) {
    return { doctor, isNew: false };
  }

  const tempPassword = generatePassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  doctor = await User.create({
    fullName: doctorName || 'Dr. ' + doctorEmail.split('@')[0],
    email: doctorEmail,
    phone: doctorPhone || '',
    password: hashedPassword,
    role: 'doctor',
    isEmailVerified: true,
    isActive: true
  });

  return { doctor, isNew: true, tempPassword };
};

// Send doctor credentials
const sendDoctorCredentials = async (doctorEmail, doctorPhone, tempPassword, patientName) => {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

  try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: `"Mediva Health System" <${process.env.EMAIL_USER}>`,
        to: doctorEmail,
        subject: '🏥 Your Mediva Doctor Account Credentials',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0;">🏥 Mediva Health System</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Doctor Portal Access</p>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Welcome, Doctor!</h2>
              
              <p style="color: #666; line-height: 1.6;">
                A patient named <strong>${patientName}</strong> has added you as their doctor and sent you a message. 
                We've created your account in the Mediva Health System.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #667eea;">Your Login Credentials:</h3>
                <p style="margin: 10px 0;"><strong>Email:</strong> ${doctorEmail}</p>
                <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <span style="background: #e8f0fe; padding: 8px 16px; border-radius: 4px; font-family: monospace; font-size: 18px; font-weight: bold; color: #667eea;">${tempPassword}</span></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  Login to Doctor Portal
                </a>
              </div>
              
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
                <p style="margin: 0; color: #856404;">
                  <strong>⚠️ Security Notice:</strong> Please change your password after logging in for the first time.
                </p>
              </div>
              
              <h3 style="color: #333; margin-top: 30px;">What you can do:</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>View and respond to patient queries</li>
                <li>Access patient medical history and medications</li>
                <li>Track patient health reports</li>
                <li>Manage your profile and settings</li>
              </ul>
              
              <p style="color: #999; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                If you did not expect this email or have concerns, please contact us immediately.
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Doctor credentials sent to ${doctorEmail}`);
    }
  } catch (error) {
    console.error('Error sending doctor credentials email:', error);
  }

  try {
    if (doctorPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const message = `MEDIVA DOCTOR PORTAL\n\nPatient ${patientName} has added you as their doctor.\n\nLogin: ${loginUrl}\nEmail: ${doctorEmail}\nPassword: ${tempPassword}\n\nPlease login and change your password.`;

      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: doctorPhone
      });
      console.log(`Doctor credentials SMS sent to ${doctorPhone}`);
    }
  } catch (error) {
    console.error('Error sending doctor credentials SMS:', error);
  }
};

// Update doctor info
export const updateDoctorInfo = catchAsync(async (req, res, next) => {
  const { name, hospital, email, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      doctorInfo: { name, hospital, email, phone }
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Doctor information updated successfully',
    data: user.doctorInfo
  });
});

// Get doctor info
export const getDoctorInfo = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user.doctorInfo || {}
  });
});

// Send query to doctor (UPDATED WITH NOTIFICATION)
export const sendDoctorQuery = catchAsync(async (req, res, next) => {
  const { problem } = req.body;

  if (!problem || problem.trim().length === 0) {
    return next(new AppError('Please describe your problem', 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (!user.doctorInfo || !user.doctorInfo.email) {
    return next(new AppError('Please add doctor information first', 400));
  }

  const { doctor, isNew, tempPassword } = await createOrGetDoctorAccount(
    user.doctorInfo.email,
    user.doctorInfo.name,
    user.doctorInfo.phone
  );

  const query = await Query.create({
    patientId: user._id,
    doctorId: doctor._id,
    doctorEmail: doctor.email,
    question: problem,
    status: 'pending',
    patientInfo: {
      name: user.fullName,
      email: user.email,
      phone: user.phone,
      age: user.age,
      medicalHistory: user.medicalHistory?.map(mh => mh.condition) || []
    }
  });

  if (isNew) {
    await sendDoctorCredentials(
      doctor.email,
      user.doctorInfo.phone,
      tempPassword,
      user.fullName
    );
  }

  // ✅ CREATE NOTIFICATION FOR DOCTOR
  try {
    await Notification.create({
      userId: doctor._id,
      type: 'patient_query',
      title: '💬 New Patient Query',
      message: `${user.fullName} sent you a message`,
      icon: '💬',
      relatedId: query._id,
      relatedModel: 'Query',
      priority: 'high',
      actionUrl: '/doctor/queries',
      metadata: {
        patientName: user.fullName,
        patientEmail: user.email,
        queryPreview: problem.substring(0, 100)
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    console.log('Notification created for doctor about new query');
  } catch (notifError) {
    console.error('Failed to create notification:', notifError);
  }

  const results = { email: false, sms: false };
  let successCount = 0;

  // Send Email notification
  if (doctor.email) {
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

        const mailOptions = {
          from: `"Mediva Health System" <${process.env.EMAIL_USER}>`,
          to: doctor.email,
          subject: `🔔 New Patient Query from ${user.fullName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0;">New Patient Query</h2>
              </div>
              <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
                <h3 style="color: #333;">Patient Information</h3>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                  <p><strong>Name:</strong> ${user.fullName}</p>
                  <p><strong>Email:</strong> ${user.email}</p>
                  <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
                  ${user.age ? `<p><strong>Age:</strong> ${user.age} years</p>` : ''}
                </div>
                
                <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3; margin: 20px 0;">
                  <h3 style="color: #2196F3; margin-top: 0;">Patient's Query:</h3>
                  <p style="white-space: pre-wrap; line-height: 1.6;">${problem}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${loginUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                    Login to Respond
                  </a>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                  Please log in to your doctor portal to respond to this query and view the patient's complete medical history.
                </p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        results.email = true;
        successCount++;
        console.log(`Query notification email sent to doctor: ${doctor.email}`);
      }
    } catch (error) {
      console.error('Email sending failed:', error.message);
    }
  }

  // Send SMS notification
  if (user.doctorInfo.phone) {
    try {
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        const message = `NEW PATIENT QUERY\n\nFrom: ${user.fullName}\nPhone: ${user.phone || 'N/A'}\n\nQuery: ${problem.substring(0, 100)}${problem.length > 100 ? '...' : ''}\n\nLogin to Mediva to respond: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: user.doctorInfo.phone
        });
        results.sms = true;
        successCount++;
        console.log(`Query SMS sent to doctor: ${user.doctorInfo.phone}`);
      }
    } catch (error) {
      console.error('SMS sending failed:', error.message);
    }
  }

  if (successCount === 0 && !isNew) {
    return next(new AppError('Failed to send query. Please check your configuration.', 500));
  }

  res.status(200).json({
    success: true,
    message: isNew
      ? `Doctor account created and query sent! Credentials have been sent to ${doctor.email}`
      : `Query sent successfully via ${results.email ? 'email' : ''} ${results.email && results.sms ? 'and' : ''} ${results.sms ? 'SMS' : ''}`,
    data: {
      query,
      doctorCreated: isNew,
      notificationsSent: results
    }
  });
});

// Get all queries for doctor
export const getDoctorQueries = catchAsync(async (req, res, next) => {
  const { status, priority, page = 1, limit = 20 } = req.query;

  const filter = { doctorId: req.user.id };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const queries = await Query.find(filter)
    .populate('patientId', 'fullName email phone age medicalHistory medications')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await Query.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: queries,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    total: count
  });
});

// Get single query details
export const getQueryDetails = catchAsync(async (req, res, next) => {
  const query = await Query.findOne({
    _id: req.params.id,
    doctorId: req.user.id
  }).populate('patientId', 'fullName email phone age medicalHistory medications height weight bloodType');

  if (!query) {
    return next(new AppError('Query not found', 404));
  }

  if (!query.isReadByDoctor) {
    query.isReadByDoctor = true;
    await query.save();
  }

  res.status(200).json({
    success: true,
    data: query
  });
});

// Reply to query (UPDATED WITH NOTIFICATION)
export const replyToQuery = catchAsync(async (req, res, next) => {
  const { response } = req.body;

  if (!response || response.trim().length === 0) {
    return next(new AppError('Please provide a response', 400));
  }

  const query = await Query.findOne({
    _id: req.params.id,
    doctorId: req.user.id
  }).populate('patientId', 'fullName email phone');

  if (!query) {
    return next(new AppError('Query not found', 404));
  }

  query.response = response;
  query.status = 'responded';
  query.respondedAt = new Date();
  query.isReadByPatient = false;
  await query.save();

  const patient = query.patientId;
  const doctor = await User.findById(req.user.id);

  // ✅ CREATE NOTIFICATION FOR PATIENT
  try {
    await Notification.create({
      userId: patient._id,
      type: 'doctor_response',
      title: '💬 Doctor Responded',
      message: `Dr. ${doctor.fullName} has responded to your query`,
      icon: '💬',
      relatedId: query._id,
      relatedModel: 'Query',
      priority: 'high',
      actionUrl: '/dashboard?tab=3',
      metadata: {
        doctorName: doctor.fullName,
        responsePreview: response.substring(0, 100)
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    console.log('Notification created for patient about doctor response');
  } catch (notifError) {
    console.error('Failed to create notification:', notifError);
  }

  // Send response notification to patient
  try {
    if (patient.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const mailOptions = {
        from: `"Mediva Health System" <${process.env.EMAIL_USER}>`,
        to: patient.email,
        subject: `✅ Dr. ${doctor.fullName} Responded to Your Query`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #03dac6 0%, #667eea 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
              <h2 style="margin: 0;">Doctor's Response Received</h2>
            </div>
            <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
              <p style="color: #666; line-height: 1.6;">
                Dr. ${doctor.fullName} has responded to your query.
              </p>
              
              <div style="background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ddd;">
                <h3 style="color: #333; margin-top: 0;">Your Question:</h3>
                <p style="color: #666; white-space: pre-wrap;">${query.question}</p>
              </div>
              
              <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; border-left: 4px solid #03dac6; margin: 20px 0;">
                <h3 style="color: #03dac6; margin-top: 0;">Doctor's Response:</h3>
                <p style="color: #333; white-space: pre-wrap; line-height: 1.6;">${response}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background: linear-gradient(135deg, #03dac6 0%, #667eea 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                  View in Dashboard
                </a>
              </div>
              
              <p style="color: #999; font-size: 14px; margin-top: 30px;">
                If you have any follow-up questions, you can send another message to your doctor.
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`Response notification sent to patient: ${patient.email}`);
    }

    if (patient.phone && process.env.TWILIO_ACCOUNT_SID) {
      const smsMessage = `DOCTOR RESPONSE\n\nDr. ${doctor.fullName} responded to your query.\n\nResponse: ${response.substring(0, 120)}${response.length > 120 ? '...' : ''}\n\nView full response in Mediva app.`;

      await twilioClient.messages.create({
        body: smsMessage,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: patient.phone
      });
      console.log(`Response SMS sent to patient: ${patient.phone}`);
    }
  } catch (error) {
    console.error('Error sending response notification:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Response sent successfully',
    data: query
  });
});

// Get doctor's patients
export const getDoctorPatients = catchAsync(async (req, res, next) => {
  const queries = await Query.find({ doctorId: req.user.id })
    .populate('patientId', 'fullName email phone age medicalHistory medications')
    .sort({ createdAt: -1 });

  const patientMap = new Map();
  queries.forEach(query => {
    if (query.patientId && !patientMap.has(query.patientId._id.toString())) {
      patientMap.set(query.patientId._id.toString(), {
        ...query.patientId.toObject(),
        lastQueryDate: query.createdAt,
        totalQueries: 1,
        pendingQueries: query.status === 'pending' ? 1 : 0
      });
    } else if (query.patientId) {
      const patient = patientMap.get(query.patientId._id.toString());
      patient.totalQueries++;
      if (query.status === 'pending') patient.pendingQueries++;
    }
  });

  const patients = Array.from(patientMap.values());

  res.status(200).json({
    success: true,
    count: patients.length,
    data: patients
  });
});

// Get patient details with medications
export const getPatientDetails = catchAsync(async (req, res, next) => {
  const patient = await User.findById(req.params.patientId)
    .select('fullName email phone age dateOfBirth address height weight bloodType medicalHistory');

  if (!patient) {
    return next(new AppError('Patient not found', 404));
  }

  const medications = await Medication.find({
    userId: patient._id,
    isActive: true
  }).sort({ createdAt: -1 });

  const queries = await Query.find({
    patientId: patient._id,
    doctorId: req.user.id
  }).sort({ createdAt: -1 }).limit(10);

  res.status(200).json({
    success: true,
    data: {
      patient,
      medications,
      queries
    }
  });
});

// Get doctor dashboard stats
export const getDoctorDashboardStats = catchAsync(async (req, res, next) => {
  const doctorId = req.user.id;

  const totalQueries = await Query.countDocuments({ doctorId });

  const pendingQueries = await Query.countDocuments({
    doctorId,
    status: 'pending'
  });

  const respondedQueries = await Query.countDocuments({
    doctorId,
    status: 'responded'
  });

  const uniquePatients = await Query.distinct('patientId', { doctorId });
  const totalPatients = uniquePatients.length;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentQueries = await Query.countDocuments({
    doctorId,
    createdAt: { $gte: sevenDaysAgo }
  });

  const unreadQueries = await Query.countDocuments({
    doctorId,
    isReadByDoctor: false
  });

  const respondedQueriesWithTime = await Query.find({
    doctorId,
    status: 'responded',
    respondedAt: { $exists: true }
  }).select('createdAt respondedAt');

  let avgResponseTimeHours = 0;
  if (respondedQueriesWithTime.length > 0) {
    const totalResponseTime = respondedQueriesWithTime.reduce((sum, query) => {
      return sum + (query.respondedAt - query.createdAt);
    }, 0);
    avgResponseTimeHours = Math.round(totalResponseTime / respondedQueriesWithTime.length / (1000 * 60 * 60));
  }

  res.status(200).json({
    success: true,
    data: {
      totalQueries,
      pendingQueries,
      respondedQueries,
      totalPatients,
      recentQueries,
      unreadQueries,
      avgResponseTimeHours,
      responseRate: totalQueries > 0 ? Math.round((respondedQueries / totalQueries) * 100) : 0
    }
  });
});

// Get patient's own queries
export const getPatientQueries = catchAsync(async (req, res, next) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = { patientId: req.user.id };

  if (status) filter.status = status;

  const queries = await Query.find(filter)
    .populate('doctorId', 'fullName email phone')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await Query.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: queries,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    total: count
  });
});

// Get single query details for patient
export const getPatientQueryDetails = catchAsync(async (req, res, next) => {
  const query = await Query.findOne({
    _id: req.params.id,
    patientId: req.user.id
  }).populate('doctorId', 'fullName email phone');

  if (!query) {
    return next(new AppError('Query not found', 404));
  }

  if (query.response && !query.isReadByPatient) {
    query.isReadByPatient = true;
    await query.save();
  }

  res.status(200).json({
    success: true,
    data: query
  });
});

// Mark query as read
export const markQueryAsRead = catchAsync(async (req, res, next) => {
  const query = await Query.findOne({
    _id: req.params.id,
    patientId: req.user.id
  });

  if (!query) {
    return next(new AppError('Query not found', 404));
  }

  query.isReadByPatient = true;
  await query.save();

  res.status(200).json({
    success: true,
    message: 'Query marked as read'
  });
});

// Get patient's unread response count
export const getUnreadResponseCount = catchAsync(async (req, res, next) => {
  const count = await Query.countDocuments({
    patientId: req.user.id,
    status: 'responded',
    isReadByPatient: false
  });

  res.status(200).json({
    success: true,
    count
  });
});