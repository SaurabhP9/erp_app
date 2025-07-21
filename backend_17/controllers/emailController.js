const nodemailer = require("nodemailer");

exports.sendTicketEmail = async (req, res) => {
  const { to, subject, text, html } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Click ERP Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, info });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ success: false, error: "Failed to send email." });
  }
};
