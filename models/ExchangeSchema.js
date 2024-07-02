import mongoose from "mongoose";

// Define the schema for order details
const ExchangeDetailsSchema = new mongoose.Schema({
    SellQuantity: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    Totalamount: {
        type: Number,
        required: true
    }
}, { _id: false });

const codDetailsSchema = new mongoose.Schema({
    withdrawAmount: {
        type: Number,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    emailId: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    fullAddress: {
        type: String,
        required: true
    },
    postCode: {
        type: String,
        required: true
    },
    currentLocation: {
        type: {
            type: String,
            required: true
        },
        
    }
}, { _id: false });

// Define the schema for Bank Transfer details
const bankTransferDetailsSchema = new mongoose.Schema({
    beneficiaryName: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        required: true
    },
    ifscCode: {
        type: String,
        required: true
    },
    bankName: {
        type: String,
        required: true
    },
    accountNo: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        required: true
    }
}, { _id: false });


const ExchangeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ExchangeDetails: {
        type: ExchangeDetailsSchema,
    },
   
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'Bank Transfer']
    },
    codDetails: codDetailsSchema,
    bankTransferDetails: bankTransferDetailsSchema,
    ExchangeStatus: {
      type: String,
      enum: ['pending', 'completed', 'canceled'],
      default: 'pending',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
    statusLevel: {
        type: Number,
        default: 0
    }
   
  },
  {
    timestamps: true,
  }
);

ExchangeSchema.pre('save', async function(next) {
    // Update the user's order when a new order place 
    await mongoose.model('User').updateOne(
      { _id: this.userId },
      { $push: { ExchangeHistory: this._id } }
    );
    next();
  });

const Exchange = mongoose.model('Exchange', ExchangeSchema);

export default Exchange;
