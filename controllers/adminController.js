import User from "../models/userSchema.js";
import CurrencyValue from "../models/currencySchema.js";
import jwt from "jsonwebtoken";
import otpVerification from "../models/otpSchema.js";
import {  emailTransporter } from "../config/otpConfig.js";


export const sendAdminOtp = async (req,res) => {
    try {
        const {email,password} = req.body

        if(email != process.env.ADMIN_EMAIL && password != process.env.ADMIN_PASSWORD){
            return res.status(401).json({ status: "error", message: "Invalid credentials" });        
        }

        const user = await User.findOne({ email: email });

        let otp = `${Math.floor(10000  + Math.random() * 9000)}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Verify your email",
            text: `Your OTP is:${otp}`,
          };
      
          const newOtpVerification = await new otpVerification({
            userId: user._id,
            email: user.email,
            phone: user.phone,
            otp: otp,
          });
          await newOtpVerification.save();
          await emailTransporter.sendMail(mailOptions);

          return res.status(200).json({
            status: "success",
            message: "OTP sent successfully to admin's inbox.",
          });

        } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
}

export const adminLogin = async (req,res) => {
    try {
        const {otp} = req.body

        if (otp) {
            // OTP Verification Logic
            const userVerification = await otpVerification.findOne({ otp: otp });
            if (!userVerification) {
              return res.status(400).json({
                status: "error",
                message: "User verification failed or Otp expired ",
              })
            }

            const admin = await User.findOne({ email: userVerification.email });
            if (!admin) {
              return res.status(400).json({
                status: "error",
                message: "Admin not found",
              });
            }

            const accessToken = jwt.sign(
                {
                  name: admin.name,
                  email: admin.email,
                  id: admin.id,
                },
                process.env.ADMIN_ACCESS_TOKEN_SECRET,
                {
                  expiresIn: "1d",
                }
              );

              admin.isAdmin = true
              await admin.save();
            
        
         
              return res.status(200).json({
                status: "success",
                message: "Login successful",
                data: { accessToken, admin: admin.name, id: admin.id },
              });

        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Server error" });
    }
} 

export const setCurrencyValue = async (req, res) => {
  try {
    const { currency, value } = req.body;
    const adminId = req.adminId
    const newCurrencyValue = new CurrencyValue({
      currency,
      value,
      adminId
    });
    await newCurrencyValue.save();
    res.status(201).json({ message: 'Currency value set successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};







export default {
    sendAdminOtp,
    adminLogin,
    setCurrencyValue
  };

  