const nodemailer = require('nodemailer');
require('dotenv').config();

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email to store owner
const sendStoreNotification = async (formData) => {
  const { name, phone, email, comment } = formData;
  
  const mailOptions = {
    from: `"Click Super Mall" <${process.env.EMAIL_USER}>`,
    to: process.env.STORE_EMAIL,
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #4CAF50; }
          .button {
            display: inline-block;
            padding: 10px 20px;
            background: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${name}</div>
            </div>
            
            <div class="field">
              <div class="label">Phone:</div>
              <div class="value">${phone}</div>
            </div>
            
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${email}</div>
            </div>
            
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${comment.replace(/\n/g, '<br>')}</div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="mailto:${email}" class="button">Reply to Customer</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Store notification sent');
    return true;
  } catch (error) {
    console.error('Error sending store notification:', error);
    return false;
  }
};

// Send auto-reply to customer
const sendCustomerAutoReply = async (formData) => {
  const { name, email, comment } = formData;
  
  const mailOptions = {
    from: `"Click Super Mall" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Thank you for contacting Click Super Mall',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .message-box { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Thank You for Contacting Us!</h2>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to Click Super Mall. We have received your message and will get back to you within 24 hours.</p>
            
            <div class="message-box">
              <strong>Your Message:</strong>
              <p>${comment.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p><strong>Store Information:</strong></p>
            <p>
              Click Super Mall<br>
              SLTB Bus Stand, U 100, Avissawella<br>
              Hours: Everyday 9:00AM - 7:00PM<br>
              Phone: 0767508349
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Auto-reply sent to customer');
    return true;
  } catch (error) {
    console.error('Error sending auto-reply:', error);
    return false;
  }
};

module.exports = { sendStoreNotification, sendCustomerAutoReply };