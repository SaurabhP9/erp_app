const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  socketTimeout: 60000,
});

const sendEmail = async (to, subject, text, html, cc = []) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    cc,
    subject,
    text,
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;