import mongoose from "mongoose";
const Schema = mongoose.Schema;

// สร้าง Schema สำหรับคำขอเป็นเพื่อน
const FriendRequestSchema = new Schema({
  requestId: {
    type: String,
    required: true,
    unique: true
  },
  from: {
    email: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    photoURL: {
      type: String,
      required: true
    }
  },
  to: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  roomId: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// สร้าง compound index เพื่อป้องกันการส่งคำขอซ้ำระหว่างผู้ใช้เดียวกัน
FriendRequestSchema.index({ 'from.email': 1, 'to': 1 }, { unique: true });

// ใช้ default export เพื่อให้สามารถนำเข้าแบบ import FriendRequest from ... ได้
export default mongoose.model('FriendRequest', FriendRequestSchema);
