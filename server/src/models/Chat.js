import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider', required: true },
  lastMessage: String,
  lastMessageAt: Date,
  unreadUser: { type: Number, default: 0 },
  unreadProvider: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Chat', chatSchema);
