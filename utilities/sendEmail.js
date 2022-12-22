import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_APP_USERNAME,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  // 2) Define the email options
  const mailOptions = {
    from: 'Khoa Nguyen <nguyenthoaidangkhoa@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // 3) Actually send the email
  await transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error(err);
  });
};

export default sendEmail;
