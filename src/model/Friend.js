// Friend.js
import mongoose from "mongoose";

const FriendSchema = new mongoose.Schema(
  {
    email: String,
    friends: [String],
    following: { type: [String], default: [] },
    followers: { type: [String], default: [] },
  },
  { timestamps: true }
);

// addFriend: เพิ่มเพื่อน
FriendSchema.statics.addFriend = async function (userEmail, friendEmail) {
  let user = await this.findOne({ email: userEmail });
  if (!user) {
    user = new this({ email: userEmail, friends: [friendEmail] });
  } else {
    if (!user.friends.includes(friendEmail)) {
      user.friends.push(friendEmail);
    }
  }
  await user.save();
  return user;
};

// removeFriend: ลบเพื่อน
FriendSchema.statics.removeFriend = async function (userEmail, friendEmail) {
  const user = await this.findOne({ email: userEmail });
  if (!user) throw new Error("User not found");

  user.friends = user.friends.filter((f) => f !== friendEmail);
  await user.save();
  return user;
};

// ✅ เพิ่ม getAllUsers ตรงนี้
FriendSchema.statics.getAllUsers = async function () {
  return await this.find(); // ดึง users ทั้งหมดใน collection 'friends'
};

export const Friend = mongoose.model("Friend", FriendSchema);
export default Friend;
