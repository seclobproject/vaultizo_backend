import express from 'express';
const adminRoute = express.Router()
import adminController from '../controllers/adminController.js';

adminRoute
.post('/login',adminController.sendAdminOtp)
.post('/adminLogin',adminController.adminLogin)



export default adminRoute
