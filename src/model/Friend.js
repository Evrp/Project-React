// Friend.js
import mongoose from "mongoose";

const FriendSchema = new mongoose.Schema(
  {
    email: String,
    // เปลี่ยน friends เป็น array ของ object เพื่อเก็บ roomId ด้วย
    friends: [
      {
        email: String,
        roomId: String,
      }
    ],
    following: { type: [String], default: [] },
    followers: { type: [String], default: [] },
  },
  { timestamps: true }
);

// addFriend: เพิ่มเพื่อน (รองรับ roomId)
FriendSchema.statics.addFriend = async function (userEmail, friendEmail, roomId) {
  let user = await this.findOne({ email: userEmail });
  if (!user) {
    user = new this({
      email: userEmail,
      friends: [{ email: friendEmail, roomId }],
    });
  } else {
    if (!user.friends.some(f => f.email === friendEmail)) {
      user.friends.push({ email: friendEmail, roomId });
    }
  }
  await user.save();
  return user;
};

// removeFriend: ลบเพื่อน (ลบด้วย email)
FriendSchema.statics.removeFriend = async function (userEmail, friendEmail) {
  const user = await this.findOne({ email: userEmail });
  if (!user) throw new Error("User not found");
  user.friends = user.friends.filter((f) => f.email !== friendEmail);
  await user.save();
  return user;
};

// ✅ เพิ่ม getAllUsers ตรงนี้
FriendSchema.statics.getAllUsers = async function () {
  return await this.find(); // ดึง users ทั้งหมดใน collection 'friends'
};

export const Friend = mongoose.model("Friend", FriendSchema);
export default Friend;
