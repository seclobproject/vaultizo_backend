import User from "../models/user.js";
import { validateRegister } from "../models/ValidationShema.js";
import bcrypt from "bcrypt";
import jwt, { decode } from "jsonwebtoken";
import { twilioClient, emailTransporter } from "../config/otpConfig.js";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import otpVerification from "../models/otpModel.js";

// user registration controller (method : post)

export const register = async (req, res) => {
  console.log(req.body);
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

    let otp = `${Math.floor(10000 + Math.random() * 9000)}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify your email",
      text: `Your OTP is:${otp}`,
    };

    const newOtpVerification = await new otpVerification({
      email: user.email,
      otp: otp,
    });
    await newOtpVerification.save();

    await emailTransporter.sendMail(mailOptions);

    return res.status(200).json({
      status: "success",
      message: "Login successful. Email notification sent.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const OtpVerification = async (req, res) => {
  try {
    const otp = req.body.otp;

    if (otp) {
      // OTP Verification Logic
      const userVerification = await otpVerification.findOne({ otp: otp });
      if (!userVerification) {
        return res.status(400).json({
          status: "error",
          message: "User verification failed or Otp expired ",
        });
      }

      const user = await User.findOne({ email: userVerification.email });

      if (!user) {
        return res.status(400).json({
          status: "error",
          message: "User not found",
        });
      }
      // Generating access token

      const accessToken = jwt.sign(
        {
          username: user.name,
          email: user.email,
        },
        process.env.USER_ACCESS_TOKEN_SECRET,
        {
          expiresIn: "10m",
        }
      );
      // Generating refresh token
      const refreshToken = jwt.sign(
        {
          email: user.email,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "1d" }
      );

      // Assigning refresh token in http-only cookie
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });
      return res.status(200).json({
        status: "success",
        message: "Login successful",
        data: { accessToken, username: user.name, id: user.id },
      });
    } else if (refreshToken) {
      // verify refresh token
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decode) => {
          if (err) {
            return res.status(406).json({ message: "Unauthorized" });
          }
          const user = await User.findOne({ email: decode.email });

          if (!user) {
            return res.status(400).json({
              status: "error",
              message: "User not found",
            });
          }

          const accessToken = jwt.sign(
            {
              username: user.name,
              email: user.email,
            },
            process.env.USER_ACCESS_TOKEN_SECRET,
            { expiresIn: "10m" }
          );
          return res.status(200).json({
            status: "success",
            message: "Token refreshed",
            data: { accessToken, username: user.name, id: user._id },
          });
        }
      );
    } else {
      return res.status(400).json({ message: "Bad request" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const forgotPasswordOtp = async (req, res) => {
  try {
    const { email, phone } = req.body;

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

    let otp = `${Math.floor(10000 + Math.random() * 9000)}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verify your email",
      text: `OTP for  Change password : ${otp}`,
    };

    const newOtpVerification = await new otpVerification({
      email: user.email,
      otp: otp,
    });
    await newOtpVerification.save();

    await emailTransporter.sendMail(mailOptions);

    return res.status(200).json({
      status: "success",
      message: "Otp sent successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const OTPVerification = async (req, res) => {
  try {
    const { otp } = req.body;
    const otpMatch = await otpVerification.findOne({ otp: otp });

    if (!otpMatch) {
      return res
        .status(404)
        .json({ status: "error", message: "Otp expired or invalid otp" });
    }

    // deleting the otp to prevent the reuse
    await otpVerification.deleteOne({ otp: otp });

    if (otpMatch) {
      return res
        .status(200)
        .json({ status: "success", message: "Sucessfully varified otp" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const ChangePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.userId; // taking the user id from the authentication sections payload

    const hashPassword = await bcrypt.hash(password, 10);

    const changePassword = await User.findByIdAndUpdate(userId, {
      password: hashPassword,
    });
    res
      .status(200)
      .json({ status: "success", message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const AddPersonalDetails = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      name,
      nickname,
      dateOfBirth,
      gender,
      maritalStatus,
      idCardNo,
      email,
      mobileNumber,
      country,
      address,
      bankName,
      branchName,
      accountNo,
      vaultizoUserId,
      accountCreationDate,
      vaultizoReferralCode,
    } = req.body;

    const personaldetail = await User.find({ _id: userId });
    const data = personaldetail[0].personalDetails;

    if (data.length < 1) {
      await User.findOneAndUpdate(
        { _id: userId },
        {
          $push: {
            personalDetails: {
              name: name,
              nickname: nickname,
              dateOfBirth: dateOfBirth,
              gender: gender,
              maritalStatus: maritalStatus,
              idCardNo: idCardNo,
              email: email,
              mobileNumber: mobileNumber,
              country: country,
              address: address,
              bankName: bankName,
              branchName: branchName,
              accountNo: accountNo,
              vaultizoUserId: vaultizoUserId,
              accountCreationDate: accountCreationDate,
              vaultizoReferralCode: vaultizoReferralCode,
            },
          },
        }
      );
      res.status(200).json({
        status: "success",
        message: "Successfully added the personal details",
      });
    }
    res.status(400).json({
      status: "faliure",
      message: "already addaed the personal details",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export default {
  register,
  sendOTPLoginVerification,
  OtpVerification,
  forgotPasswordOtp,
  OTPVerification,
  ChangePassword,
  AddPersonalDetails,
};

//       const generateAccessToken = (user) => {
//         return jwt.sign(
//           { id: user.id, username: user.name },
//           process.env.USER_ACCESS_TOKEN_SECRET,
//           { expiresIn: "1d" }
//         );
//       };

//       // Function to generate refresh token
//       const generateRefreshToken = (user) => {
//         return jwt.sign(
//           { id: user.id, username: user.name },
//           process.env.REFRESH_TOKEN_SECRET,
//           { expiresIn: "7d" }
//         );
//       };

//       // Generate JWT access and refresh token
//       const accessToken = generateAccessToken(user);
//       const refreshToken = generateRefreshToken(user);
//       let refreshTokens = [];

//       // Store the refresh token securely in the empty array
//       refreshTokens.push(refreshToken);

//       // user information including the refresh and access tokens
//       res.status(200).json({
//         status: "success",
//         message: "Login successful",
//         data: { accessToken, refreshToken, username: user.name, id: user.id },
//       });
//     }

// export const RefreshAccesstoken = async (req,res) => {
//   if (req.cookies?.jwt){
//   //destructure the refresh token from the cookies
//   const refreshToken = req.cookies.jwt

//   jwt.verify(refreshToken ,process.env.REFRESH_TOKEN_SECRET,
//     (err,decode) => {
//       if(err){

//        // Wrong Refesh Token
//         return res.status(406).json({ message: 'Unauthorized' });
//       }
//       else {
//       // sending the correct refresh token
//       const accessToken = jwt.sign({
//         username :
//       })
//       }
//     }
//    )

//   }
// }
