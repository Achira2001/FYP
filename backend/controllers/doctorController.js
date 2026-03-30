import User from '../models/User.js';
import Query from '../models/Query.js';
import Medication from '../models/Medication.js';
import Notification from '../models/Notification.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { sendSMS, sendEmail, smsReady } from '../services/notificationService.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';


// Generate random 8-char password
const generatePassword = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Create doctor account or return existing one
const createOrGetDoctorAccount = async (doctorEmail, doctorName, doctorPhone) => {
  let doctor = await User.findOne({ email: doctorEmail, role: 'doctor' });

  if (doctor) {
    return { doctor, isNew: false };
  }

  const tempPassword   = generatePassword();
  const hashedPassword = await bcrypt.hash(tempPassword, 12);

  doctor = await User.create({
    fullName:        doctorName || `Dr. ${doctorEmail.split('@')[0]}`,
    email:           doctorEmail,
    phone:           doctorPhone || '',
    password:        hashedPassword,
    role:            'doctor',
    isEmailVerified: true,
    isActive:        true
  });

  return { doctor, isNew: true, tempPassword };
};


// Send login credentials to a newly created doctor
const sendDoctorCredentials = async (doctorEmail, doctorPhone, tempPassword, patientName) => {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;

  // Send EMAIL with credentials
  await sendEmail({
    to:      doctorEmail,
    subject: '\u{1F3E5} Your Mediva Doctor Account Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">\u{1F3E5} Mediva Health System</h1>
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
            <p style="margin: 10px 0;">
              <strong>Temporary Password:</strong>
              <span style="background: #e8f0fe; padding: 8px 16px; border-radius: 4px; font-family: monospace; font-size: 18px; font-weight: bold; color: #667eea;">
                ${tempPassword}
              </span>
            </p>
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
  });

  // Send SMS with credentials (via Text.lk)
  if (doctorPhone && smsReady()) {
    await sendSMS({
      to:      doctorPhone,
      message: `MEDIVA DOCTOR PORTAL\n\nPatient ${patientName} has added you as their doctor.\n\nLogin: ${loginUrl}\nEmail: ${doctorEmail}\nPassword: ${tempPassword}\n\nPlease login and change your password.`
    });
    console.log(` Doctor credentials SMS sent to ${doctorPhone}`);
  }
};


// UPDATE DOCTOR INFO  PUT /api/doctor-info
export const updateDoctorInfo = catchAsync(async (req, res, next) => {
  const { name, hospital, email, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { doctorInfo: { name, hospital, email, phone } },
    { new: true, runValidators: true }
  );

  if (!user) return next(new AppError('User not found', 404));

  res.status(200).json({
    success: true,
    message: 'Doctor information updated successfully',
    data:    user.doctorInfo
  });
});


// GET DOCTOR INFO  GET /api/doctor-info
export const getDoctorInfo = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  res.status(200).json({
    success: true,
    data: user.doctorInfo || {}
  });
});


// SEND QUERY TO DOCTOR  POST /api/doctor-query
export const sendDoctorQuery = catchAsync(async (req, res, next) => {
  const { problem } = req.body;

  if (!problem || problem.trim().length === 0) {
    return next(new AppError('Please describe your problem', 400));
  }

  const user = await User.findById(req.user.id);
  if (!user) return next(new AppError('User not found', 404));

  if (!user.doctorInfo?.email) {
    return next(new AppError('Please add your doctor\'s email first', 400));
  }

  // Get or create doctor account
  const { doctor, isNew, tempPassword } = await createOrGetDoctorAccount(
    user.doctorInfo.email,
    user.doctorInfo.name,
    user.doctorInfo.phone
  );

  // Save query in DB
  const query = await Query.create({
    patientId:   user._id,
    doctorId:    doctor._id,
    doctorEmail: doctor.email,
    question:    problem,
    status:      'pending',
    patientInfo: {
      name:           user.fullName,
      email:          user.email,
      phone:          user.phone,
      age:            user.age,
      medicalHistory: user.medicalHistory?.map(mh => mh.condition) || []
    }
  });

  // If doctor account is brand-new, send credentials
  if (isNew) {
    await sendDoctorCredentials(
      doctor.email,
      user.doctorInfo.phone,
      tempPassword,
      user.fullName
    );
  }

  // Create in-app notification for doctor
  try {
    await Notification.create({
      userId:       doctor._id,
      type:         'patient_query',
      title:        '\u{1F4AC} New Patient Query',
      message:      `${user.fullName} sent you a message`,
      icon:         '\u{1F4AC}',
      relatedId:    query._id,
      relatedModel: 'Query',
      priority:     'high',
      actionUrl:    '/doctor/queries',
      metadata: {
        patientName:  user.fullName,
        patientEmail: user.email,
        queryPreview: problem.substring(0, 100)
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  } catch (notifError) {
    console.error('Failed to create notification:', notifError);
  }

  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
  const results  = { email: false, sms: false };

  //  Email notification to doctor
  const emailResult = await sendEmail({
    to:      doctor.email,
    subject: `U+1F514 New Patient Query from ${user.fullName}`,
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
            Please log in to your doctor portal to respond and view the patient's complete medical history.
          </p>
        </div>
      </div>
    `
  });
  results.email = emailResult.success;

  //  SMS notification to doctor (via Text.lk) 
  if (user.doctorInfo.phone && smsReady()) {
    const smsResult = await sendSMS({
      to:      user.doctorInfo.phone,
      message: `NEW PATIENT QUERY\n\nFrom: ${user.fullName}\nPhone: ${user.phone || 'N/A'}\n\nQuery: ${problem.substring(0, 100)}${problem.length > 100 ? '...' : ''}\n\nLogin to Mediva: ${loginUrl}`
    });
    results.sms = smsResult.success;
  }

  if (!results.email && !results.sms && !isNew) {
    return next(new AppError('Failed to send query. Please check your notification configuration.', 500));
  }

  res.status(200).json({
    success: true,
    message: isNew
      ? `Doctor account created and query sent! Credentials sent to ${doctor.email}`
      : `Query sent successfully${results.email ? ' via email' : ''}${results.sms ? ' and SMS' : ''}.`,
    data: {
      query,
      doctorCreated:      isNew,
      notificationsSent:  results
    }
  });
});


// GET ALL QUERIES FOR DOCTOR  GET /api/queries
export const getDoctorQueries = catchAsync(async (req, res, next) => {
  const { status, priority, page = 1, limit = 20 } = req.query;

  const filter = { doctorId: req.user.id };
  if (status)   filter.status   = status;
  if (priority) filter.priority = priority;

  const queries = await Query.find(filter)
    .populate('patientId', 'fullName email phone age medicalHistory medications')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await Query.countDocuments(filter);

  res.status(200).json({
    success:     true,
    data:        queries,
    totalPages:  Math.ceil(count / limit),
    currentPage: page,
    total:       count
  });
});


// GET SINGLE QUERY  GET /api/queries/:id
export const getQueryDetails = catchAsync(async (req, res, next) => {
  const query = await Query.findOne({ _id: req.params.id, doctorId: req.user.id })
    .populate('patientId', 'fullName email phone age medicalHistory medications height weight bloodType');

  if (!query) return next(new AppError('Query not found', 404));

  if (!query.isReadByDoctor) {
    query.isReadByDoctor = true;
    await query.save();
  }

  res.status(200).json({ success: true, data: query });
});


// REPLY TO QUERY  POST /api/queries/:id/reply
export const replyToQuery = catchAsync(async (req, res, next) => {
  const { response } = req.body;

  if (!response || response.trim().length === 0) {
    return next(new AppError('Please provide a response', 400));
  }

  const query = await Query.findOne({ _id: req.params.id, doctorId: req.user.id })
    .populate('patientId', 'fullName email phone');

  if (!query) return next(new AppError('Query not found', 404));

  query.response       = response;
  query.status         = 'responded';
  query.respondedAt    = new Date();
  query.isReadByPatient = false;
  await query.save();

  const patient = query.patientId;
  const doctor  = await User.findById(req.user.id);

  // Create in-app notification for patient
  try {
    await Notification.create({
      userId:       patient._id,
      type:         'doctor_response',
      title:        '\u{1F4AC} Doctor Responded',
      message:      `Dr. ${doctor.fullName} has responded to your query`,
      icon:         '\u{1F4AC}',
      relatedId:    query._id,
      relatedModel: 'Query',
      priority:     'high',
      actionUrl:    '/dashboard?tab=3',
      metadata: {
        doctorName:      doctor.fullName,
        responsePreview: response.substring(0, 100)
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  } catch (notifError) {
    console.error('Failed to create notification:', notifError);
  }

  //  Email to patient 
  await sendEmail({
    to:      patient.email,
    subject: `\u2705 Dr. ${doctor.fullName} Responded to Your Query`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #03dac6 0%, #667eea 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">Doctor's Response Received</h2>
        </div>
        <div style="padding: 30px; background: #f9f9f9; border-radius: 0 0 10px 10px;">
          <p style="color: #666; line-height: 1.6;">Dr. ${doctor.fullName} has responded to your query.</p>
          <div style="background: #fff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ddd;">
            <h3 style="color: #333; margin-top: 0;">Your Question:</h3>
            <p style="color: #666; white-space: pre-wrap;">${query.question}</p>
          </div>
          <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; border-left: 4px solid #03dac6; margin: 20px 0;">
            <h3 style="color: #03dac6; margin-top: 0;">Doctor's Response:</h3>
            <p style="color: #333; white-space: pre-wrap; line-height: 1.6;">${response}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard"
               style="background: linear-gradient(135deg, #03dac6 0%, #667eea 100%); color: white; padding: 14px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              View in Dashboard
            </a>
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            If you have follow-up questions, you can send another message to your doctor.
          </p>
        </div>
      </div>
    `
  });

  //  SMS to patient (via Text.lk) 
  if (patient.phone && smsReady()) {
    await sendSMS({
      to:      patient.phone,
      message: `DOCTOR RESPONSE\n\nDr. ${doctor.fullName} responded to your query.\n\nResponse: ${response.substring(0, 120)}${response.length > 120 ? '...' : ''}\n\nView full response in Mediva app.`
    });
  }

  res.status(200).json({
    success: true,
    message: 'Response sent successfully',
    data:    query
  });
});


// GET DOCTOR'S PATIENTS  GET /api/patients
export const getDoctorPatients = catchAsync(async (req, res, next) => {
  const queries = await Query.find({ doctorId: req.user.id })
    .populate('patientId', 'fullName email phone age medicalHistory medications')
    .sort({ createdAt: -1 });

  const patientMap = new Map();

  queries.forEach(query => {
    if (!query.patientId) return;
    const id = query.patientId._id.toString();

    if (!patientMap.has(id)) {
      patientMap.set(id, {
        ...query.patientId.toObject(),
        lastQueryDate:  query.createdAt,
        totalQueries:   1,
        pendingQueries: query.status === 'pending' ? 1 : 0
      });
    } else {
      const p = patientMap.get(id);
      p.totalQueries++;
      if (query.status === 'pending') p.pendingQueries++;
    }
  });

  res.status(200).json({
    success: true,
    count:   patientMap.size,
    data:    Array.from(patientMap.values())
  });
});


// GET SINGLE PATIENT DETAILS  GET /api/patients/:patientId
export const getPatientDetails = catchAsync(async (req, res, next) => {
  const patient = await User.findById(req.params.patientId)
    .select('fullName email phone age dateOfBirth address height weight bloodType medicalHistory');

  if (!patient) return next(new AppError('Patient not found', 404));

  const medications = await Medication.find({ userId: patient._id, isActive: true }).sort({ createdAt: -1 });
  const queries     = await Query.find({ patientId: patient._id, doctorId: req.user.id }).sort({ createdAt: -1 }).limit(10);

  res.status(200).json({
    success: true,
    data: { patient, medications, queries }
  });
});


// DOCTOR DASHBOARD STATS  GET /api/dashboard/stats
export const getDoctorDashboardStats = catchAsync(async (req, res, next) => {
  const doctorId = req.user.id;

  const [totalQueries, pendingQueries, respondedQueries, uniquePatients, unreadQueries] = await Promise.all([
    Query.countDocuments({ doctorId }),
    Query.countDocuments({ doctorId, status: 'pending' }),
    Query.countDocuments({ doctorId, status: 'responded' }),
    Query.distinct('patientId', { doctorId }),
    Query.countDocuments({ doctorId, isReadByDoctor: false })
  ]);

  const sevenDaysAgo  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentQueries = await Query.countDocuments({ doctorId, createdAt: { $gte: sevenDaysAgo } });

  const respondedWithTime = await Query.find({
    doctorId,
    status:      'responded',
    respondedAt: { $exists: true }
  }).select('createdAt respondedAt');

  let avgResponseTimeHours = 0;
  if (respondedWithTime.length > 0) {
    const total = respondedWithTime.reduce((sum, q) => sum + (q.respondedAt - q.createdAt), 0);
    avgResponseTimeHours = Math.round(total / respondedWithTime.length / (1000 * 60 * 60));
  }

  res.status(200).json({
    success: true,
    data: {
      totalQueries,
      pendingQueries,
      respondedQueries,
      totalPatients:       uniquePatients.length,
      recentQueries,
      unreadQueries,
      avgResponseTimeHours,
      responseRate: totalQueries > 0 ? Math.round((respondedQueries / totalQueries) * 100) : 0
    }
  });
});


// PATIENT — GET OWN QUERIES  GET /api/patient/queries
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
    success:     true,
    data:        queries,
    totalPages:  Math.ceil(count / limit),
    currentPage: page,
    total:       count
  });
});


// PATIENT — GET SINGLE QUERY  GET /api/patient/queries/:id
export const getPatientQueryDetails = catchAsync(async (req, res, next) => {
  const query = await Query.findOne({ _id: req.params.id, patientId: req.user.id })
    .populate('doctorId', 'fullName email phone');

  if (!query) return next(new AppError('Query not found', 404));

  if (query.response && !query.isReadByPatient) {
    query.isReadByPatient = true;
    await query.save();
  }

  res.status(200).json({ success: true, data: query });
});


// PATIENT — MARK QUERY AS READ  PATCH /api/patient/queries/:id/read
export const markQueryAsRead = catchAsync(async (req, res, next) => {
  const query = await Query.findOne({ _id: req.params.id, patientId: req.user.id });

  if (!query) return next(new AppError('Query not found', 404));

  query.isReadByPatient = true;
  await query.save();

  res.status(200).json({ success: true, message: 'Query marked as read' });
});


// PATIENT — UNREAD COUNT  GET /api/patient/queries/unread/count
export const getUnreadResponseCount = catchAsync(async (req, res, next) => {
  const count = await Query.countDocuments({
    patientId:     req.user.id,
    status:        'responded',
    isReadByPatient: false
  });

  res.status(200).json({ success: true, count });
});