const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = (to, subject, text)=> {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME ,
            pass: process.env.EMAIL_PASSWORD,
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USERNAME ,
        to,
        subject,
        text
    };

    transporter.sendMail(mailOptions, function(err, info){
        if (err) {
            console.error('Error sending email:', err);
        } else {
            console.log('Email sent successfully:', info.response);
        }
    });
    
};
module.exports = sendEmail;