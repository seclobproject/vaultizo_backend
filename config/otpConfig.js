import nodemailer from 'nodemailer';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  host:'smtp.gmail.com',
  port:465,
  secure:true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export { twilioClient, emailTransporter };
