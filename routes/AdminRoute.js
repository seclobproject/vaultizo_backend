import express from 'express';
const adminRoute = express.Router()
import adminController from '../controllers/adminController.js';
import verifyToken from '../middleware/adminAuth.js'


adminRoute
.post('/login',adminController.sendAdminOtp)
.post('/adminLogin',adminController.adminLogin)

.post('/setvalue',adminController.setCurrencyValue)
.get('/users',verifyToken,adminController.ListUser)
.get('/user/:id',verifyToken,adminController.ListUsersById)
.get('/order',verifyToken,adminController.ListOrder)
.get('/exchange',verifyToken,adminController.ListExchange)



export default adminRoute
