const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // use your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendVerificationCode = (to, code) => {
    return transporter.sendMail({
      to,
      subject: 'Verify your email',
      html: `<p>Your verification code is: <strong>${code}</strong>. It will expire in 10 minutes.</p>`
    });
  };
  
