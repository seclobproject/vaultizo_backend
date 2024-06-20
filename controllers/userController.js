import User from "../models/user.js";
import { validateRegister } from "../models/ValidationShema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { twilioClient, emailTransporter } from '../config/otpConfig.js';
import otpGenerator from 'otp-generator';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Temporary OTP store
const otpStore = {};



// user registration controller (method : post)

export const register = async (req, res) => {
  console.log(req.body)
  try {
    // Validate the request body
    const { error } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Create a user
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      country: req.body.country,
      password: req.body.password,
    });

    await user.save();

    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// user Login controller (method : post)

export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res
        .status(400)
        .json({ status: "error", message: "Email or phone must be provided" });
    }

    // Find the user by email or phone
    const user = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });
    

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User not found" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ status: "error", message: "Password must be provided" });
    }

    // Password validation
    const checkPass = await bcrypt.compare(password, user.password);
    if (!checkPass) {
      return res
        .status(400)
        .json({ status: "error", message: "Password incorrect" });
    }


   
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export default { register, login };



// const generateAccessToken = (user) => {
//   return jwt.sign(
//     { id: user.id, username: user.name },
//     process.env.USER_ACCESS_TOKEN_SECRET,
//     { expiresIn: "15m" }
//   );
// };

// // Function to generate refresh token
// const generateRefreshToken = (user) => {
//   return jwt.sign(
//     { id: user.id, username: user.name },
//     process.env.REFRESH_TOKEN_SECRET,
//     { expiresIn: '7d'  } 
//   );
// };

// // Generate JWT access and refresh token 
// const accessToken = generateAccessToken(user);
// const refreshToken = generateRefreshToken(user);
// let refreshTokens = [];

// // Store the refresh token securely in the empty array
// refreshTokens.push(refreshToken);

// // user information including the refresh and access tokens
// res.status(200).json({
//   status: "success",
//   message: "Login successful",
//   data: { accessToken, refreshToken, username: user.name, id: user.id },
// });


// const sendOtpEmail = async (email, otp) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Your OTP Code',
//     text: `Your OTP code is ${otp}`,
//   };
//   await emailTransporter.sendMail(mailOptions);
// };

// const sendOtpSms = async (phone, otp) => {
//   const phoneNumber = parsePhoneNumberFromString(phone, 'IN'); // Adjust the default country code as necessary

//   if (!phoneNumber || !phoneNumber.isValid()) {
//     throw new Error('Invalid phone number');
//   }

//   const formattedPhone = phoneNumber.format('E.164');

//   await twilioClient.messages.create({
//     body: `Your OTP code is ${otp}`,
//     from: process.env.TWILIO_PHONE_NUMBER,
//     to: formattedPhone,
//   });
// };

//     // Generate OTP
//     const otp = otpGenerator.generate(6, {
//       digits: true,
//       alphabets: false,
//       upperCase: false,
//       specialChars: false,
//     });

//     // Send OTP
//     if (email) {
//       await sendOtpEmail(email, otp);
//     } else if (phone) {
//       await sendOtpSms(phone, otp);
//     }

//     // Store OTP temporarily (you can use Redis or database with an expiration time)
//     // For example, using an in-memory store (not recommended for production):
//     otpStore[user._id] = { otp, expires: Date.now() + 300000 }; // OTP valid for 5 minutes

//     res.status(200).json({
//       status: 'success',
//       message: 'OTP sent successfully',
//     });