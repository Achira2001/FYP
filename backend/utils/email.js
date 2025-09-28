import nodemailer from 'nodemailer';

class Email {
  constructor(user, url = '', otp = '') {
    this.to = user.email;
    this.firstName = user.fullName.split(' ')[0];
    this.fullName = user.fullName;
    this.url = url;
    this.otp = otp;
    this.from = process.env.FROM_EMAIL || 'Smart Health Assistant <noreply@smarthealth.com>';
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Production email service
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // Development - Gmail configuration with improved settings
    return nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use TLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // This should be the app password
      },
      tls: {
        rejectUnauthorized: false // Allow self-signed certificates
      }
    });
  }

  async send(template, subject) {
    try {
      // Validate email configuration
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Email configuration missing in environment variables');
      }

      console.log(`📧 Email Configuration Check:`);
      console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
      console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '***configured***' : 'NOT SET'}`);

      // 1) Render HTML based on template
      const html = this.generateHTML(template);

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: this.generateText(template),
      };

      // 3) Create a transport and send email
      console.log(`📤 Attempting to send email to: ${this.to}`);
      console.log(`📧 Subject: ${subject}`);
      
      const transporter = this.newTransport();
      
      // Verify transporter configuration
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
      
      const result = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return result;
      
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      
      // Provide more specific error information
      if (error.code === 'EAUTH') {
        console.error('🔐 Authentication failed. Please check:');
        console.error('   1. Gmail 2FA is enabled');
        console.error('   2. App password is correctly set in EMAIL_PASS');
        console.error('   3. App password has no spaces and is 16 characters');
      }
      
      throw error;
    }
  }

  generateHTML(template) {
    switch (template) {
      case 'welcome':
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">Smart Health Assistant</h1>
            </div>
            <h2>Welcome ${this.firstName}!</h2>
            <p>Thank you for registering with Smart Health Assistant. Please verify your email using the code below:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h2 style="color: #1f2937; letter-spacing: 5px; margin: 0; font-size: 32px;">${this.otp}</h2>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't create this account, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Smart Health Assistant - Your health, our priority
            </p>
          </div>
        `;

      case 'otp-resend':
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">Smart Health Assistant</h1>
            </div>
            <h2>Email Verification</h2>
            <p>Hi ${this.firstName},</p>
            <p>Here's your new verification code:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h2 style="color: #1f2937; letter-spacing: 5px; margin: 0; font-size: 32px;">${this.otp}</h2>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Smart Health Assistant - Your health, our priority
            </p>
          </div>
        `;

      case 'password-reset':
        return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb;">Smart Health Assistant</h1>
            </div>
            <h2>Password Reset</h2>
            <p>Hi ${this.firstName},</p>
            <p>You requested a password reset. Use the code below to reset your password:</p>
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h2 style="color: #1f2937; letter-spacing: 5px; margin: 0; font-size: 32px;">${this.otp}</h2>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; text-align: center;">
              Smart Health Assistant - Your health, our priority
            </p>
          </div>
        `;

      default:
        return `<p>Your verification code is: ${this.otp}</p>`;
    }
  }

  generateText(template) {
    switch (template) {
      case 'welcome':
        return `Welcome ${this.firstName}! Your verification code is: ${this.otp}. This code will expire in 10 minutes.`;
      case 'otp-resend':
        return `Hi ${this.firstName}, your new verification code is: ${this.otp}. This code will expire in 10 minutes.`;
      case 'password-reset':
        return `Hi ${this.firstName}, your password reset code is: ${this.otp}. This code will expire in 10 minutes.`;
      default:
        return `Your verification code is: ${this.otp}`;
    }
  }

  async sendWelcomeOTP() {
    await this.send('welcome', 'Welcome to Smart Health Assistant - Verify Your Email');
  }

  async sendOTPResend() {
    await this.send('otp-resend', 'Smart Health Assistant - New Verification Code');
  }

  async sendPasswordReset() {
    await this.send('password-reset', 'Smart Health Assistant - Password Reset Code');
  }
}

export default Email;