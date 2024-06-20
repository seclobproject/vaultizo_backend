import mongoose from 'mongoose';


const uri = process.env.CONNECTION_STRING

mongoose.connect(uri)
    .then(() => console.log('MongoDB connected'))
    .catch((error) => console.error('MongoDB connection error:', error));

export default mongoose;    