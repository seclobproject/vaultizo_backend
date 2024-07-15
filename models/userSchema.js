import mongoose from "mongoose";
import bcrypt from "bcrypt";

// personal details schema to embedded to the user schema
const personalDetailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  nickname: {
    type: String,
    minlength: 2,
    maxlength: 50,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true,
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married', 'Divorced', 'Widowed'],
    required: true,
  },
  idCardNo: {
    type: String,
    required: true,
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
    maxlength: 15,
  },
  country: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  address: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  bankName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
  },
  branchName: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100,
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
    default: Date.now,
  },
  vaultizoReferralCode: {
    type: String,
    required: true,
  },
});

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
    isAdmin: {
      type: Boolean,
      default: false,
    },
    personalDetails: {
      type: personalDetailsSchema,
      required: false,
    },
    orderHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order', // Reference to the Order model
    }],
    ExchangeHistory: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exchange', // Reference to the exchange model
    }],
    referralCode: {
      type: String,
      unique: true,
      sparse: true, // Ensures uniqueness for non-null values
    }
  },
  {
    timestamps: true,
  }
);

// Create indexes for the schema
userSchema.index({ name: 1 });
userSchema.index({ email: 1 });

// Pre-validation hook to ensure either email or phone is provided
userSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    this.invalidate("email", "Either email or phone must be provided.");
    this.invalidate("phone", "Either email or phone must be provided.");
  }
  next();
});

// Pre-save hook to hash the password if modified or new
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Create the User model
const User = mongoose.model("User", userSchema);

export default User;
