const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.log('--- MAIL NOTIFICATION MOCK (SMTP details not fully configured in .env) ---');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.text}`);
    console.log('------------------------------------------------------------------------');
    return { mock: true, message: 'Email logged to console (Mock mode)' };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    auth: {
      user: user,
      pass: pass
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@civicconnect.gov',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`Message sent: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;
