const mongoose = require('mongoose');
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

// สร้างอินเด็กซ์สำหรับการค้นหาอย่างรวดเร็ว
UserSchema.index({ email: 1 });

module.exports = mongoose.model('User', UserSchema);
