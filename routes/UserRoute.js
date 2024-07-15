import express from 'express';
const userRoute = express.Router()
import userController from '../controllers/userController.js';
import OrderController from '../controllers/OrderController.js';
import ExchangeController from '../controllers/ExchangeController.js';


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
.get('/listHistory',verifyToken,userController.ListHistory)


//Exchange routes
.post('/exchange',verifyToken,ExchangeController.DollerExchange)

//Buying routes
.post('/placeOrder',verifyToken,OrderController.placeOrder);



export default userRoute