import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  ref: { type: String },
  note: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const walletSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  balance: { type: Number, default: 0 },
  currency: { type: String, default: 'EUR' },
  transactions: [transactionSchema]
});

export default mongoose.model('Wallet', walletSchema);
