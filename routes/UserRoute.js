import express from 'express';
const userRoute = express.Router()
import userController from '../controllers/userController.js';
userRoute
.post('/register',userController.register)
.post('/login',userController.login)


export default userRoute