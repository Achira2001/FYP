import twilio from 'twilio';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Twilio client
let twilioClient;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('✅ Twilio client initialized successfully');
  } else {
    console.log('⚠️ Twilio credentials not found, SMS functionality disabled');
  }
} catch (error) {
  console.error('❌ Twilio initialization failed:', error);
}

// Initialize email transporter
let transporter;
try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log('✅ Email transporter initialized successfully');
  } else {
    console.log('⚠️ Email credentials not found, email functionality disabled');
  }
} catch (error) {
  console.error('❌ Email transporter initialization failed:', error);
}

export { twilioClient, transporter };