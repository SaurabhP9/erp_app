// services/sendEmail.js
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email using SendGrid's Web API (not SMTP)
 */

module.exports = async function sendEmail(to, subject, text, html, cc) {
  const msg = {
    to,
    from: process.env.EMAIL_USER, // Must be verified in SendGrid
    subject,
    text,
    html,
    cc,
  };

  try {
    const result = await sgMail.send(msg);
    console.log('✅ Email sent via SendGrid API');
    return result;
  } catch (error) {
    console.error('❌ SendGrid API error:', error.response?.body || error.message);
    throw error;
  }
};
