const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendEmail({ to, subject, text, html }) {
  try {
    await transporter.sendMail({
      from: `"SBGS Plateforme" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || "", // Plain text fallback
      html: html || text, // Use html if provided, otherwise use text
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

module.exports = sendEmail;
