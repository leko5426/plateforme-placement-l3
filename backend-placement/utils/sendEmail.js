const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // false pour le port 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      // Ignore l'erreur de certificat (antivirus ou réseau local)
      rejectUnauthorized: false 
    }
  });

  const mailOptions = {
    from: `${process.env.EMAIL_FROM}`,
    to: options.to,
    subject: options.subject,
    html: options.htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;