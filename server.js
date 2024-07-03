import './dotenv.js'
import userRoute from './routes/UserRoute.js';
import adminRoute from './routes/AdminRoute.js'
import express from 'express';
import mongoose from './config/dbConnection.js';
import cookieparser from "cookie-parser"  

const app = express();
const port = process.env.PORT || 3000 ;


app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cookieparser());
app.use('/user',userRoute)
app.use('/admin',adminRoute)

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});