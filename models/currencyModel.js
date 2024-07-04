import mongoose from "mongoose";

const currencyValueSchema = new mongoose.Schema({

  adminId: {
      type: String, // Unique ID for the admin
      required: true
    },
  currency: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const CurrencyValue = mongoose.model('CurrencyValue', currencyValueSchema);

export default CurrencyValue;

