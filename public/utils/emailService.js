// utils/emailService.js

const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

async function sendEmail({ email, subject, html }) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // SMTP server host
      port: 465,              // Port for SSL
      secure: true,           // Set to true for SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email, // recipient's email
      subject: subject, // Subject line
      html:html, // plain text body
     
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
}

module.exports = sendEmail;
