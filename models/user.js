import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
    },
    country: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    personalDetails : [{
      name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
    nickname: {
        type: String,
        minlength: 2,
        maxlength: 50
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    maritalStatus: {
        type: String,
        enum: ['Single', 'Married', 'Divorced', 'Widowed'],
        required: true
    },
    idCardNo: {
      type: String,
      required: true 
  },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
       
    },
    mobileNumber: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 15
    },
    country: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },
    address: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    bankName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    branchName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100
    },
    accountNo: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50,
        
    },
    vaultizoUserId: {
        type: String,
        required: true,
    },
    accountCreationDate: {
        type: Date,
        default: Date.now
    },
    vaultizoReferralCode: {
        type: String,
        required: true,
    }
  }]
        
  },
  {
    timestamps: true,
  }
);

userSchema.index({ name: 1 }); 
userSchema.index({ email: 1 });

userSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    this.invalidate("email", "Either email or phone must be provided.");
    this.invalidate("phone", "Either email or phone must be provided.");
  }
  next();
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;