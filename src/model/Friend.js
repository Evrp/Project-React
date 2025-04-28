// Friend.js
import mongoose from 'mongoose';

const FriendSchema = new mongoose.Schema({
  email: String,
  friends: [String],
});

// เพิ่ม static method
FriendSchema.statics.addFriend = async function (userEmail, friendEmail) {
  let user = await this.findOne({ email: userEmail });

  if (!user) {
    // ถ้า user ยังไม่มี, สร้างใหม่
    user = new this({ email: userEmail, friends: [friendEmail] });
  } else {
    // ถ้ามีแล้ว, เพิ่มเพื่อนเข้าไปถ้ายังไม่มี
    if (!user.friends.includes(friendEmail)) {
      user.friends.push(friendEmail);
    }
  }

  await user.save();
  return user;
};


// เพิ่ม static สำหรับลบเพื่อนด้วย
FriendSchema.statics.removeFriend = async function (userEmail, friendEmail) {
  const user = await this.findOne({ email: userEmail });
  if (!user) throw new Error('User not found');

  user.friends = user.friends.filter(f => f !== friendEmail);
  await user.save();
  return user;
};

const  Friend = mongoose.model('friend', FriendSchema);

// ✅ export แบบ ESModule
export default Friend;
