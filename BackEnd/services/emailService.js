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

// Send order confirmation email to customer
const sendOrderConfirmationEmail = async (orderData) => {
  const {
    email,
    customerName,
    orderNumber,
    orderId,
    items = [],
    subtotal,
    shipping,
    total,
    paymentMethod,
    isBankDeposit,
    address,
    city,
    district,
    province,
    paidDate
  } = orderData;

  const itemRows = items.map(item => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #f0ece6;font-size:14px;color:#1a1a1a;">
        ${item.name || 'Product'}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #f0ece6;font-size:14px;color:#6b6560;text-align:center;">
        ${item.sizeLabel || item.size || '-'}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #f0ece6;font-size:14px;color:#6b6560;text-align:center;">
        ${item.qty || item.quantity || 1}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #f0ece6;font-size:14px;color:#1a1a1a;text-align:right;font-weight:600;">
        Rs. ${((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString()}.00
      </td>
    </tr>
  `).join('');
  const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/+$/, '');
  const uploadSlipUrl = frontendUrl
    ? `${frontendUrl}/upload-slip?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}&id=${orderId}`
    : '';

  const mailOptions = {
    from: `"Click Clothing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmed – #${orderNumber} | Click Clothing`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Order Confirmation</title>
      </head>
      <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                <!-- Header -->
                <tr>
                  <td style="background:#1a1a1a;padding:36px 40px;text-align:center;">
                    <div style="font-size:28px;font-weight:700;color:#c9a882;letter-spacing:2px;">CLICK</div>
                    <div style="font-size:13px;color:#9a9a9a;margin-top:4px;letter-spacing:1px;">CLOTHING</div>
                  </td>
                </tr>

                <!-- Success Banner -->
                <tr>
                  <td style="background:linear-gradient(135deg,#1a1a1a 0%,#2d2d2d 100%);padding:28px 40px;text-align:center;">
                    <div style="font-size:36px;margin-bottom:8px;">✅</div>
                    <div style="font-size:22px;font-weight:600;color:#ffffff;margin-bottom:6px;">Order Confirmed!</div>
                    <div style="font-size:14px;color:#c9a882;">Thank you, ${customerName}. Your order has been placed successfully.</div>
                  </td>
                </tr>

                <!-- Order Number -->
                <tr>
                  <td style="padding:24px 40px 0;text-align:center;">
                    <div style="display:inline-block;background:#f8f6f2;border:1px solid #e5ddd4;border-radius:50px;padding:10px 24px;">
                      <span style="font-size:13px;color:#9a958d;">Order #</span>
                      <span style="font-size:15px;font-weight:700;color:#1a1a1a;letter-spacing:1px;">${orderNumber}</span>
                    </div>
                    ${paidDate ? `<div style="font-size:13px;color:#9a958d;margin-top:8px;">${paidDate}</div>` : ''}
                  </td>
                </tr>

                <!-- Items Table -->
                <tr>
                  <td style="padding:28px 40px 0;">
                    <div style="font-size:16px;font-weight:600;color:#1a1a1a;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #1a1a1a;">
                      🛍️ Items Ordered
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <thead>
                        <tr style="background:#f8f6f2;">
                          <th style="padding:10px 8px;font-size:12px;color:#9a958d;text-transform:uppercase;letter-spacing:0.8px;text-align:left;font-weight:500;">Product</th>
                          <th style="padding:10px 8px;font-size:12px;color:#9a958d;text-transform:uppercase;letter-spacing:0.8px;text-align:center;font-weight:500;">Size</th>
                          <th style="padding:10px 8px;font-size:12px;color:#9a958d;text-transform:uppercase;letter-spacing:0.8px;text-align:center;font-weight:500;">Qty</th>
                          <th style="padding:10px 8px;font-size:12px;color:#9a958d;text-transform:uppercase;letter-spacing:0.8px;text-align:right;font-weight:500;">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemRows}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Totals -->
                <tr>
                  <td style="padding:20px 40px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#6b6560;">Subtotal</td>
                        <td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">Rs. ${(subtotal || 0).toLocaleString()}.00</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#6b6560;">Shipping</td>
                        <td style="padding:6px 0;font-size:14px;color:#1a1a1a;text-align:right;">Rs. ${(shipping || 0).toLocaleString()}.00</td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;font-size:17px;font-weight:700;color:#1a1a1a;border-top:2px solid #1a1a1a;">Total</td>
                        <td style="padding:12px 0;font-size:17px;font-weight:700;color:#1a1a1a;text-align:right;border-top:2px solid #1a1a1a;">Rs. ${(total || 0).toLocaleString()}.00</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Payment & Delivery -->
                <tr>
                  <td style="padding:24px 40px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="48%" style="background:#f8f6f2;border-radius:10px;padding:16px 18px;vertical-align:top;">
                          <div style="font-size:11px;font-weight:600;color:#9a958d;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">💳 Payment</div>
                          <div style="font-size:14px;color:#1a1a1a;font-weight:500;">${paymentMethod || 'N/A'}</div>
                        </td>
                        <td width="4%"></td>
                        <td width="48%" style="background:#f8f6f2;border-radius:10px;padding:16px 18px;vertical-align:top;">
                          <div style="font-size:11px;font-weight:600;color:#9a958d;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">📍 Delivery</div>
                          <div style="font-size:13px;color:#1a1a1a;line-height:1.5;">${address || ''}, ${city || ''}, ${district || ''}, ${province || ''}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${isBankDeposit ? `
                <!-- Bank Deposit Instructions -->
                <tr>
                  <td style="padding:28px 40px 0;">
                    <div style="background:linear-gradient(135deg,#fff8e6 0%,#fff3d0 100%);border:2px solid #f0b429;border-radius:14px;padding:24px;">
                      <div style="font-size:16px;font-weight:700;color:#7d5a00;margin-bottom:16px;">⚠️ Action Required — Bank Deposit Payment</div>
                      <div style="font-size:13px;color:#5a3e00;line-height:1.8;margin-bottom:20px;">
                        Please deposit the order amount to the bank account below within <strong>48 hours</strong>.<br/>
                        Use your unique order number <strong>${orderNumber}</strong> as the <strong>bank transfer remark/reference</strong>.<br/>
                        After depositing, upload your payment slip using the button below.
                      </div>

                      <table width="100%" cellpadding="0" cellspacing="0" style="background:white;border-radius:10px;padding:16px;margin-bottom:20px;">
                        <tr><td style="padding:6px 0;font-size:13px;color:#5a3e00;"><strong>Bank Name:</strong></td><td style="font-size:13px;color:#1a1a1a;text-align:right;">${process.env.BANK_NAME || 'Contact store'}</td></tr>
                        <tr><td style="padding:6px 0;font-size:13px;color:#5a3e00;"><strong>Account Name:</strong></td><td style="font-size:13px;color:#1a1a1a;text-align:right;">${process.env.BANK_ACCOUNT_NAME || 'Contact store'}</td></tr>
                        <tr><td style="padding:6px 0;font-size:13px;color:#5a3e00;"><strong>Account Number:</strong></td><td style="font-size:13px;color:#1a1a1a;text-align:right;font-weight:700;">${process.env.BANK_ACCOUNT_NUMBER || 'Contact store'}</td></tr>
                        <tr><td style="padding:6px 0;font-size:13px;color:#5a3e00;"><strong>Branch:</strong></td><td style="font-size:13px;color:#1a1a1a;text-align:right;">${process.env.BANK_BRANCH || 'Contact store'}</td></tr>
                        <tr><td colspan="2" style="padding-top:12px;border-top:1px solid #f0e8cc;"><strong style="color:#7d5a00;">Payment Reference:</strong> <span style="font-size:15px;font-weight:800;color:#b8860b;letter-spacing:1px;">${orderNumber}</span></td></tr>
                      </table>

                      <div style="text-align:center;">
                        <a href="${uploadSlipUrl}"
                           style="display:inline-block;background:linear-gradient(135deg,#c9a882,#b8912e);color:white;padding:14px 32px;border-radius:50px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.5px;box-shadow:0 4px 14px rgba(201,168,130,0.4);">
                          📤 Upload Payment Slip
                        </a>
                        <div style="font-size:11px;color:#9a8060;margin-top:10px;">⏰ Deadline: 48 hours from order placement</div>
                      </div>
                    </div>
                  </td>
                </tr>` : ''}

                <!-- What Happens Next -->
                <tr>
                  <td style="padding:28px 40px 0;">
                    <div style="font-size:15px;font-weight:600;color:#1a1a1a;margin-bottom:14px;">What happens next?</div>
                    <div style="font-size:13px;color:#4a4540;line-height:1.8;">
                      1️⃣ &nbsp;We'll prepare and pack your order<br/>
                      2️⃣ &nbsp;Your order will be dispatched soon<br/>
                      3️⃣ &nbsp;Track your order under <strong>My Account → Orders</strong><br/>
                      4️⃣ &nbsp;Download your receipt anytime from Order History
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:36px 40px;margin-top:20px;text-align:center;border-top:1px solid #ede8e1;margin:28px 40px 0;">
                    <div style="font-size:13px;color:#9a958d;">Need help? Contact us at
                      <a href="mailto:${process.env.STORE_EMAIL}" style="color:#c9a882;text-decoration:none;">${process.env.STORE_EMAIL}</a>
                    </div>
                    <div style="font-size:12px;color:#c4bdb5;margin-top:8px;">© ${new Date().getFullYear()} Click Clothing. All rights reserved.</div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    const fs = require('fs');
    const path = require('path');
    try {
      fs.appendFileSync(
        path.join(__dirname, '../email_errors.log'),
        `[${new Date().toISOString()}] SMTP Error sending to ${email}: ${error.message}\n${error.stack}\n\n`
      );
    } catch (fsErr) {
      console.error('Failed to write to error log file:', fsErr);
    }
    return false;
  }
};

// Send password reset OTP
const sendPasswordResetEmail = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Click Clothing" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333; text-align: center;">Click Clothing</h2>
        <h3 style="color: #555;">Password Reset Request</h3>
        <p style="color: #666; font-size: 16px;">
          You requested to reset your password. Use the 6-digit OTP below to securely reset your password. This code is valid for 15 minutes.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8f6f2; border: 2px dashed #c8982a; color: #111; padding: 16px 32px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 4px; display: inline-block;">
            ${otp}
          </div>
        </div>
        <p style="color: #999; font-size: 14px;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #aaa; font-size: 12px; text-align: center;">
          &copy; ${new Date().getFullYear()} Click Clothing. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

module.exports = { sendStoreNotification, sendCustomerAutoReply, sendOrderConfirmationEmail, sendPasswordResetEmail };
