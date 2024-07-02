const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    SellingAmount: {
      type: Number,
      required: true,
    },
    
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'Bank Transfer']
    },
    transactionStatus: {
      type: String,
      enum: ['pending', 'completed', 'canceled'],
      default: 'pending',
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
   
  },
  {
    timestamps: true,
  }
);

const DollarTransaction = mongoose.model('Transaction', TransactionSchema);

module.exports = DollarTransaction;
