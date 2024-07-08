import mongoose from "mongoose"

const userOTPVerificationSchema = new mongoose.Schema({
        
       userId: {
            type : String,
       },
        email:{
            type: String,
            sparse: true,
        },
        phone :{
            type: String,
            unique: false,
            sparse: true,
        },
        otp:{
            type:String
        },
        createdAt:{
            type:Date,
            default:Date.now
        }
        


})

userOTPVerificationSchema.index({createdAt:1},{expireAfterSeconds:60})

const otpVerification = mongoose.model('userOTPVerification',userOTPVerificationSchema)
export default otpVerification ;