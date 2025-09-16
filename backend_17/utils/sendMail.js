// services/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey', // literally this string
    pass: process.env.SENDGRID_API_KEY,
  },
});

/**
 * Sends an email using SendGrid + Nodemailer
 */
module.exports =  async function sendEmail(to, subject, text, html, cc) {
  const mailOptions = {
    from: process.env.EMAIL_USER, // ✅ Must be verified in SendGrid
    to,
    subject,
    text,
    html,
  };

  if (cc) mailOptions.cc = cc;

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.response);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
}