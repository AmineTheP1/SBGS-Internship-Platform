const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, text, html }) {
  try {
    const fromAddress = `SBGS Plateforme <contact@${process.env.RESEND_DOMAIN}>`;

    await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      text: text || '',
      ...(html !== undefined && { html })
    });
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

module.exports = sendEmail;