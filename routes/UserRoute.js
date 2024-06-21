import express from 'express';
const userRoute = express.Router()
import userController from '../controllers/userController.js';
import verifyToken from '../middleware/userAuth.js'
userRoute
.post('/register',userController.register)
.post('/login',userController.sendOTPLoginVerification)
.post('/login-verifed',userController.OtpVerification)
.post('/newPassOtp',verifyToken,userController.forgotPasswordOtp)
.post('/verifiedOtp' ,verifyToken,userController.OTPVerification)
.patch('/change-password',verifyToken, userController.ChangePassword)



export default userRoute