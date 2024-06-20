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

export const sendOTPLoginVerification = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    console.log( req.body)

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

    let otp=`${Math.floor(10000+Math.random() * 9000)}`;

    const mailOptions = {
      from:process.env.EMAIL_USER,
      to: user.email,
      subject:'Verify your email',
      text:`Your OTP is:${otp}`
  };  
 

  await emailTransporter.sendMail(mailOptions) ;

  return res.status(200).json({
    status: "success",
    message: "Login successful. Email notification sent.",
  });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};



export default { register, sendOTPLoginVerification };



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


