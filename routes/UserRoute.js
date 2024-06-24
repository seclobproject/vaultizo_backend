import express from 'express';
const userRoute = express.Router()
import userController from '../controllers/userController.js';
import verifyToken from '../middleware/userAuth.js'
userRoute
.post('/register',userController.register)
.post('/login',userController.sendOTPLoginVerification)
.post('/login-verifed',userController.OtpVerification)
.post('/newPassOtp',userController.forgotPasswordOtp)
.post('/verifiedOtp' ,userController.OTPVerification)
.patch('/change-password',verifyToken, userController.ChangePassword)
.post ('/addDetails',verifyToken,userController.AddPersonalDetails)
.put ('/editDetails',verifyToken,userController.EditPersonalDetails)



export default userRoute