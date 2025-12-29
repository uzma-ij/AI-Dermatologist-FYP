const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Create reusable transporter object using SMTP transport
// Port 465 requires secure: true, port 587 uses secure: false
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const isSecure = smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: smtpPort,
  secure: isSecure, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER, // Your email
    pass: process.env.SMTP_PASS, // Your email password or app password
  },
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false
  }
});

/**
 * Send email notification to doctor about new appointment booking
 * @param {string} doctorEmail - Doctor's email address
 * @param {string} patientName - Patient's name
 * @param {string} appointmentDate - Appointment date
 * @param {string} appointmentDay - Day of the week
 * @param {string} appointmentTime - Appointment time
 */
const sendAppointmentEmail = async (doctorEmail, patientName, appointmentDate, appointmentDay, appointmentTime) => {
  try {
    // Debug: Check what environment variables are loaded
    console.log('🔍 Environment check:');
    console.log('  SMTP_HOST:', process.env.SMTP_HOST || 'NOT SET');
    console.log('  SMTP_PORT:', process.env.SMTP_PORT || 'NOT SET');
    console.log('  SMTP_USER:', process.env.SMTP_USER ? '***SET***' : 'NOT SET');
    console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '***SET***' : 'NOT SET');
    
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file');
      console.error('   Make sure the .env file is in the server/ directory');
      console.error('   After adding credentials, RESTART your server');
      return { success: false, error: 'SMTP credentials not configured' };
    }

    const emailMessage = `${patientName} has booked an appointment with you at this date ${appointmentDate}, day ${appointmentDay} and time ${appointmentTime}`;

    const mailOptions = {
      from: `"AI Dermatologist" <${process.env.SMTP_USER}>`,
      to: doctorEmail,
      subject: 'New Appointment Booking - AI Dermatologist',
      text: emailMessage,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #667eea;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 0 0 5px 5px;
            }
            .message {
              font-size: 16px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>New Appointment Booking</h2>
            </div>
            <div class="content">
              <p class="message">${emailMessage}</p>
            </div>
            <div class="footer">
              <p>This is an automated email from AI Dermatologist Platform.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log('📤 Sending email to:', doctorEmail);
    
    // Verify connection before sending
    try {
      await transporter.verify();
      console.log('✅ SMTP server connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP connection verification failed:', verifyError.message);
      console.error('   This usually means:');
      console.error('   - Incorrect email or app password');
      console.error('   - 2-Step Verification not enabled');
      console.error('   - App password not generated correctly');
      return { success: false, error: `SMTP connection failed: ${verifyError.message}` };
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully! Message ID:', info.messageId);
    console.log('📬 Response:', info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      console.error('   ⚠️ Authentication failed - Check your email and app password');
    } else if (error.code === 'ECONNECTION' || error.message.includes('socket')) {
      console.error('   ⚠️ Connection failed - Check your internet and firewall settings');
      console.error('   ⚠️ Also verify SMTP_HOST and SMTP_PORT are correct');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('   ⚠️ Connection timeout - Check your network connection');
    }
    
    return { success: false, error: error.message };
  }
};

/**
 * Send email notification about appointment cancellation
 * @param {string} recipientEmail - Email of the person receiving the cancellation notice
 * @param {string} recipientName - Name of the recipient
 * @param {string} cancelledByName - Name of the person who cancelled
 * @param {string} appointmentDate - Appointment date
 * @param {string} appointmentDay - Day of the week
 * @param {string} appointmentTime - Appointment time
 */
const sendCancellationEmail = async (recipientEmail, recipientName, cancelledByName, appointmentDate, appointmentDay, appointmentTime) => {
  try {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file');
      return { success: false, error: 'SMTP credentials not configured' };
    }

    const emailMessage = `${cancelledByName} has cancelled the appointment with you at this date ${appointmentDate}, day ${appointmentDay} and time ${appointmentTime}`;

    const mailOptions = {
      from: `"AI Dermatologist" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: 'Appointment Cancellation - AI Dermatologist',
      text: emailMessage,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #dc3545;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 0 0 5px 5px;
            }
            .message {
              font-size: 16px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Appointment Cancelled</h2>
            </div>
            <div class="content">
              <p class="message">${emailMessage}</p>
            </div>
            <div class="footer">
              <p>This is an automated email from AI Dermatologist Platform.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log('📤 Sending cancellation email to:', recipientEmail);
    
    // Verify connection before sending
    try {
      await transporter.verify();
      console.log('✅ SMTP server connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP connection verification failed:', verifyError.message);
      return { success: false, error: `SMTP connection failed: ${verifyError.message}` };
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Cancellation email sent successfully! Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending cancellation email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send email notification to doctor about profile approval
 * @param {string} doctorEmail - Doctor's email address
 * @param {string} doctorName - Doctor's name
 */
const sendApprovalEmail = async (doctorEmail, doctorName) => {
  try {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file');
      return { success: false, error: 'SMTP credentials not configured' };
    }

    const emailMessage = `Your profile request has been accepted. You can now start using the AI Dermatologist platform.`;

    const mailOptions = {
      from: `"AI Dermatologist" <${process.env.SMTP_USER}>`,
      to: doctorEmail,
      subject: 'Profile Request Accepted - AI Dermatologist',
      text: `Dear ${doctorName},\n\n${emailMessage}\n\nWelcome to AI Dermatologist Platform!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #28a745;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 0 0 5px 5px;
            }
            .message {
              font-size: 16px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Profile Request Accepted</h2>
            </div>
            <div class="content">
              <p>Dear ${doctorName},</p>
              <p class="message">${emailMessage}</p>
              <p>Welcome to AI Dermatologist Platform!</p>
            </div>
            <div class="footer">
              <p>This is an automated email from AI Dermatologist Platform.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log('📤 Sending approval email to:', doctorEmail);
    
    // Verify connection before sending
    try {
      await transporter.verify();
      console.log('✅ SMTP server connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP connection verification failed:', verifyError.message);
      return { success: false, error: `SMTP connection failed: ${verifyError.message}` };
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Approval email sent successfully! Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending approval email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send email notification to doctor about profile rejection
 * @param {string} doctorEmail - Doctor's email address
 * @param {string} doctorName - Doctor's name
 */
const sendRejectionEmail = async (doctorEmail, doctorName) => {
  try {
    // Check if SMTP credentials are configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env file');
      return { success: false, error: 'SMTP credentials not configured' };
    }

    const emailMessage = `Your profile request has been rejected. Please review your profile and resubmit it.`;

    const mailOptions = {
      from: `"AI Dermatologist" <${process.env.SMTP_USER}>`,
      to: doctorEmail,
      subject: 'Profile Request Rejected - AI Dermatologist',
      text: `Dear ${doctorName},\n\n${emailMessage}\n\nPlease review your profile information and resubmit your request.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #dc3545;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 0 0 5px 5px;
            }
            .message {
              font-size: 16px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Profile Request Rejected</h2>
            </div>
            <div class="content">
              <p>Dear ${doctorName},</p>
              <p class="message">${emailMessage}</p>
              <p>Please review your profile information and resubmit your request.</p>
            </div>
            <div class="footer">
              <p>This is an automated email from AI Dermatologist Platform.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log('📤 Sending rejection email to:', doctorEmail);
    
    // Verify connection before sending
    try {
      await transporter.verify();
      console.log('✅ SMTP server connection verified');
    } catch (verifyError) {
      console.error('❌ SMTP connection verification failed:', verifyError.message);
      return { success: false, error: `SMTP connection failed: ${verifyError.message}` };
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Rejection email sent successfully! Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending rejection email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAppointmentEmail,
  sendCancellationEmail,
  sendApprovalEmail,
  sendRejectionEmail,
};

