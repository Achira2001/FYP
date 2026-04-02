import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


// TEXT.LK SMS SERVICE  


const TEXTLK_SEND_URL    = 'https://app.text.lk/api/v3/sms/send';
const TEXTLK_BALANCE_URL = 'https://app.text.lk/api/v3/balance';


// Format phone -> 94XXXXXXXXX

export const formatPhone = (phone, countryCode = '94') => {
  if (!phone) return null;
  const cleaned = phone.trim();
  const digits  = cleaned.replace(/\D/g, '');

  if (cleaned.startsWith('+'))                                  return digits;           // +94771234567 -> 94771234567
  if (digits.startsWith('0') && digits.length === 10)           return `${countryCode}${digits.slice(1)}`;  // 0771234567 -> 94771234567
  if (digits.startsWith(countryCode) && digits.length >= 11)   return digits;           // already 94...
  return `${countryCode}${digits}`;                             // fallback
};


// SEND SMS
export const sendSMS = async ({ to, message }) => {
  const apiKey   = process.env.TEXTLK_API_KEY;
  const senderId = process.env.TEXTLK_SENDER_ID || 'MedReminder';

  if (!apiKey) {
    console.warn('  SMS skipped — TEXTLK_API_KEY not set in .env');
    console.warn('   Sign up free → https://app.text.lk/register');
    return { success: false, reason: 'TEXTLK_API_KEY not configured' };
  }

  if (!to) {
    console.warn('  SMS skipped — no recipient phone');
    return { success: false, reason: 'No phone number' };
  }

  const formattedPhone = formatPhone(to);
  if (!formattedPhone) {
    console.warn(`  SMS skipped — cannot format phone: ${to}`);
    return { success: false, reason: 'Invalid phone number' };
  }

  try {
    console.log(` Sending SMS via Text.lk to ${formattedPhone}...`);

    const response = await fetch(TEXTLK_SEND_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept':        'application/json'
      },
      body: JSON.stringify({
        recipient: formattedPhone,
        sender_id: senderId,
        type:      'plain',
        message
      })
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      const msgId = result.data?.uid || result.data?.id || 'N/A';
      console.log(` SMS sent — UID: ${msgId} | To: ${formattedPhone}`);
      return { success: true, messageId: msgId };
    }

    console.error(` Text.lk SMS failed (${formattedPhone}):`, result);
    return { success: false, reason: result.message || JSON.stringify(result) };

  } catch (error) {
    console.error(` Text.lk network error (${formattedPhone}):`, error.message);
    return { success: false, reason: error.message };
  }
};


// CHECK BALANCE 

export const checkSMSBalance = async () => {
  const apiKey = process.env.TEXTLK_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch(TEXTLK_BALANCE_URL, {
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' }
    });
    const data = await response.json();
    if (data.status === 'success') {
      console.log(` Text.lk Balance: ${data.data?.balance} credits`);
    }
    return data;
  } catch (error) {
    console.error(' Could not fetch Text.lk balance:', error.message);
    return null;
  }
};


// SMS READY CHECK

export const smsReady = () => !!process.env.TEXTLK_API_KEY;


// EMAIL TRANSPORTER (Gmail)

let transporter = null;

try {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS?.trim();

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass }
    });

    transporter.verify((error) => {
      if (error) {
        console.error(' Email transporter verification failed:', error.message);
        console.error('   Check EMAIL_USER and EMAIL_PASS (use Gmail App Password)');
      } else {
        console.log(' Email transporter ready');
      }
    });
  } else {
    console.warn('  Email credentials missing — set EMAIL_USER and EMAIL_PASS in .env');
  }
} catch (error) {
  console.error(' Email transporter init failed:', error.message);
}


// SEND EMAIL

export const sendEmail = async ({ to, subject, html }) => {
  if (!transporter) return { success: false, reason: 'Email transporter not initialized' };
  if (!to)          return { success: false, reason: 'No recipient email' };

  try {
    const result = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Smart Medical Reminder'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
      to, subject, html
    });
    console.log(` Email sent — ID: ${result.messageId} | To: ${to}`);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(` Email failed (${to}):`, error.message);
    return { success: false, reason: error.message };
  }
};

export { transporter };