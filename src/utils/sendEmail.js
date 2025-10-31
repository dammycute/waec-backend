const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: (process.env.EMAIL_PORT == 465), // optionally determine secure vs startTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      // Allow self-signed certificates (for dev / staging)
      rejectUnauthorized: false
    }
  });

  const message = {
    from: process.env.EMAIL_FROM,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
