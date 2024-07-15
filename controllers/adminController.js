import User from "../models/userSchema.js";
import Order from "../models/OrderSchema.js";
import Exchange from "../models/ExchangeSchema.js";
import CurrencyValue from "../models/currencySchema.js";
import jwt from "jsonwebtoken";
import otpVerification from "../models/otpSchema.js";
import { emailTransporter } from "../config/otpConfig.js";
import mongoose from "mongoose";


export const sendAdminOtp = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email != process.env.ADMIN_EMAIL &&
      password != process.env.ADMIN_PASSWORD
    ) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid credentials" });
    }

    const user = await User.findOne({ email: email });

    let otp = `${Math.floor(10000 + Math.random() * 9000)}`;
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
};

export const adminLogin = async (req, res) => {
  try {
    const { otp } = req.body;

    if (otp) {
      // OTP Verification Logic
      const userVerification = await otpVerification.findOne({ otp: otp });
      if (!userVerification) {
        return res.status(400).json({
          status: "error",
          message: "User verification failed or Otp expired ",
        });
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

      admin.isAdmin = true;
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
};

export const setCurrencyValue = async (req, res) => {
  try {
    const { currency, value } = req.body;
    const adminId = req.adminId;
    const newCurrencyValue = new CurrencyValue({
      currency,
      value,
      adminId,
    });
    await newCurrencyValue.save();
    res.status(201).json({ message: "Currency value set successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const ListUser = async (req, res) => {
  try {
    const Page = parseInt(req.query.page) || 1
    const limit = 10
    const Users = await User.find({ isAdmin: false }).skip((Page -1) * limit).limit(limit)
   
    
    res
      .status(200)
      .json({
        status: "success",
        message: "successfully fetched users ",
        data: Users,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

export const ListUsersById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById({ _id: id });
    res
      .status(200)
      .json({
        status: "success",
        message: "successfully fetched user by id ",
        data: user,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


export const ListOrder = async (req,res) => {
  try {
    const Page = parseInt(req.query.page) || 1
    const paymentMethod = req.query.paymentMethod;
    const limit = 10
    let query = {}
    if(paymentMethod){
      query.paymentMethod = new RegExp(paymentMethod, 'i')
    }
    const orderList = await Order.find(query).populate('userId').skip((Page -1) * limit).limit(limit).exec()
    res.status(200).json({status : "success" , message : "successfully fetched orers" , data : orderList })
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
}

export const ListExchange  = async (req,res) => {
  try {
    const Page = parseInt(req.query.page) || 1
    const paymentMethod = req.query.paymentMethod;
    const limit = 10
    let query = {}
    if(paymentMethod){
      query.paymentMethod = new RegExp(paymentMethod, 'i')
    }
    const ExchangeList = await Exchange.find(query).populate('userId').skip((Page -1) * limit).limit(limit)
    res.status(200).json({status : "success" , message : "successfully fetched exchanges" , data : ExchangeList })
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
}

export const UpdateOrderStatus = async (req, res) => {
  try {
    const statusLevel = parseInt(req.query.level);
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ status: "error", message: "Invalid order ID" });
    }

    if (isNaN(statusLevel)) {
      return res.status(400).json({ status: "error", message: "Invalid status level" });
    }

    // Update the order's status level
    const updateFields = { statusLevel };

    if (statusLevel === 1) {
      updateFields.orderStatus = "Paid";
    }else if (statusLevel === 0){
      updateFields.orderStatus = "pending";
   }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateFields, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ status: "error", message: "Order not found" });
    }

    res.status(202).json({ status: "success", data: updatedOrder });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
}; 


export default {
  sendAdminOtp,
  adminLogin,
  setCurrencyValue,
  ListUser,
  ListUsersById,
  ListOrder,
  ListExchange,
  UpdateOrderStatus
};
