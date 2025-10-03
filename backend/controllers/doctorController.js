import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { twilioClient, transporter } from '../services/notificationService.js';



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

// Send query to doctor
export const sendDoctorQuery = catchAsync(async (req, res, next) => {
  const { problem } = req.body;

  if (!problem || problem.trim().length === 0) {
    return next(new AppError('Please describe your problem', 400));
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (!user.doctorInfo || (!user.doctorInfo.email && !user.doctorInfo.phone)) {
    return next(new AppError('Please add doctor information first', 400));
  }

  const results = { email: false, sms: false };
  let successCount = 0;

  // Send Email
  if (user.doctorInfo.email) {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️ Email credentials not configured');
      } else {
        const mailOptions = {
          from: `"Medical Reminder System" <${process.env.EMAIL_USER}>`,
          to: user.doctorInfo.email,
          subject: `Patient Query from ${user.fullName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(45deg, #2196F3 30%, #21CBF3 90%); color: white; padding: 20px;">
                <h2>Patient Query</h2>
              </div>
              <div style="padding: 20px; background: #f9f9f9;">
                <h3>Patient Information</h3>
                <p><strong>Name:</strong> ${user.fullName}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
                
                <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="color: #2196F3;">Problem Description</h3>
                  <p style="white-space: pre-wrap;">${problem}</p>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                  Please respond to the patient at your earliest convenience.
                </p>
              </div>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        results.email = true;
        successCount++;
        console.log(`✅ Query email sent to doctor: ${user.doctorInfo.email}`);
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
    }
  }

  // Send SMS
  if (user.doctorInfo.phone) {
    try {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        console.log('⚠️ Twilio credentials not configured');
      } else {
        const message = `PATIENT QUERY\n\nFrom: ${user.fullName}\nPhone: ${user.phone || 'N/A'}\n\nProblem: ${problem.substring(0, 150)}${problem.length > 150 ? '...' : ''}\n\nPlease check email for full details.`;
        
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: user.doctorInfo.phone
        });
        results.sms = true;
        successCount++;
        console.log(`✅ Query SMS sent to doctor: ${user.doctorInfo.phone}`);
      }
    } catch (error) {
      console.error('❌ SMS sending failed:', error.message);
    }
  }

  if (successCount === 0) {
    return next(new AppError('Failed to send query. Please check your configuration.', 500));
  }

  res.status(200).json({
    success: true,
    message: `Query sent successfully via ${results.email ? 'email' : ''} ${results.email && results.sms ? 'and' : ''} ${results.sms ? 'SMS' : ''}`,
    data: results
  });
});