import mongoose from "mongoose";

// Define the schema for order details
const orderDetailsSchema = new mongoose.Schema({
    buyQuantity: {
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

// Define the schema for COD details including customer details
const codDetailsSchema = new mongoose.Schema({
   
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
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
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

// Define the main order schema
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderDetails: {
        type: orderDetailsSchema,
    },
    expected_delivery: {
        type: String,
        required: true
    },
    WithdrawAmount: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'Bank Transfer','Wallet']
    },
    codDetails: codDetailsSchema,
    bankTransferDetails: bankTransferDetailsSchema,
    orderStatus: {
        type: String,
        required: true,
        enum: ['pending', 'Paid', 'canceled'],
        default: 'pending'
    },
    statusLevel: {
        type: Number,
        default: 0
    },
    OrderedDate: {
        type: Date,
        default: Date.now,
      }
}, {
    timestamps: true
});

orderSchema.pre('save', async function(next) {
    // Update the user's order when a new order place 
    await mongoose.model('User').updateOne(
      { _id: this.userId },
      { $push: { OrderHistory: this._id } }
    );
    next();
  });


// Indexes for efficient querying
orderSchema.index({ orderId: 1 });
orderSchema.index({ "codDetails.emailId": 1 });
orderSchema.index({ paymentMethod: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: 1 });
orderSchema.index({ "codDetails.currentLocation": "2dsphere" });

const Order = mongoose.model('Order', orderSchema);

export default Order;
