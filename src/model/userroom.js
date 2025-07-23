import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// กำหนด Schema สำหรับข้อมูลผู้ใช้และรายการเพื่อน
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: true
  },
  photoURL: {
    type: String,
    default: ''
  },
  friends: [{
    email: {
      type: String,
      required: true
    },
    roomId: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastSeen: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// ไม่จำเป็นต้องสร้าง index ซ้ำเพราะได้กำหนด unique: true ไว้แล้วที่ฟิลด์ email
// UserSchema.index({ email: 1 });

export default mongoose.model('User', UserSchema);
