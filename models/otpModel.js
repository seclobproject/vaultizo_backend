import mongoose from "mongoose"

const userOTPVerificationSchema = new mongoose.Schema({
        email:{
            type:String
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

module.exports=mongoose.model('userOTPVerification',userOTPVerificationSchema)