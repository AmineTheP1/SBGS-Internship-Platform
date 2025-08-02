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
    const mailOptions = {
      from: `"SBGS Plateforme" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || "", // Plain text fallback
    };
    
    // Only add html if it's explicitly provided and not undefined
    if (html !== undefined) {
      mailOptions.html = html;
    }
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

module.exports = sendEmail;
