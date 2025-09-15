const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, text, html, cc = []) => {
  const msg = {
    to,
    cc,
    from: process.env.EMAIL_USER, // Must be a verified sender in SendGrid
    subject,
    text,
    html,
  };
  await sgMail.send(msg);
};

module.exports = sendEmail;