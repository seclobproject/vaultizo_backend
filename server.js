import './dotenv.js'
import userRoute from './routes/UserRoute.js';
import express from 'express';
import mongoose from './config/dbConnection.js'; 

const app = express();
const port = process.env.PORT || 3000 ;


app.use(express.json())
app.use('/user',userRoute)

app.listen(port, () => {
    console.log(`Server is running on ${port}`);
});