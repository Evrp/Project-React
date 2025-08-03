import React, { useEffect, useState } from "react";
import "./ProfileModal.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";


const ProfileModal = ({ isOpen, onClose, user, userImage, setFriends, followers, setJoinedRooms, following, isCom, users }) => {
    const userEmail = localStorage.getItem("userEmail");
    const [currentUserfollow, setCurrentUserfollow] = useState(null);
    if (!isOpen || !user) return null;

    // หา user ที่ตรงกับ email หรือ usermatch ใน userImage
    const getMatchedUser = () => {
        if (!users || !userImage) return null;
        
        // หาคู่แมตช์ที่ไม่ใช่เรา
        const partnerEmail = userImage.email === userEmail ? userImage.usermatch : userImage.email;
        return users.find(u => u.email === partnerEmail);
    };

    const matchedUser = getMatchedUser();



    const getHighResPhoto = (url) => {
        if (!url) return "/default-profile.png";

        try {
            // ตรวจสอบว่า URL มีรูปแบบที่ต้องการหรือไม่
            if (typeof url === "string" && url.includes("=s")) {
                // รองรับทั้ง ...=s96-c และ ...=s96-c&... หรือ ...=s96-c?... (กรณีมี query string ต่อท้าย)
                return url.replace(/=s\d+-c(?=[&?]|$)/, "=s400-c");
            }
            return url;
        } catch (error) {
            console.error("Error processing photo URL:", error);
            return url || "/default-profile.png";
        }
    };
    const deleteUser = async (roomId, user, roomName, roomid) => {
        if (!window.confirm("คุณต้องการลบเพื่อนคนนี้หรือไม่?")) return;
        console.log("Deleting user:", user, "from room:", roomId, "with name:", roomName, "and id:", roomid);
        try {
            // ลบผู้ใช้จากเซิร์ฟเวอร์
            if (roomid) {
                await fetch(
                    `${import.meta.env.VITE_APP_API_BASE_URL
                    }/api/infomatch/${roomid}`,
                    {
                        method: "DELETE",
                    }
                );
            }
            if (user) {
                await axios.delete(
                    `${import.meta.env.VITE_APP_API_BASE_URL
                    }/api/users/${userEmail}/friends/${user}`
                );
            }
            if (roomid && roomName) {
                console.log("Deleting joined room:", roomName, "for user:", userEmail);
                await axios.delete(
                    `${import.meta.env.VITE_APP_API_BASE_URL
                    }/api/delete-joined-rooms/${roomid}/${userEmail}`
                );
                setJoinedRooms((prev) => ({
                    ...prev,
                    roomNames: prev.roomNames.filter((name) => name !== roomName),
                    roomIds: prev.roomIds.filter((id) => id !== roomid && id !== roomName),
                }));
            }
            setFriends((prevFriends) =>
                prevFriends.filter((friend) => friend.email !== user)
            );



            // แสดงแจ้งเตือนสำเร็จ
            toast.success("ลบผู้ใช้สำเร็จ");

            // ปิด modal
            onClose();
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("เกิดข้อผิดพลาดในการลบผู้ใช้");
        }
    };
    const fetchGmailUser = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_APP_API_BASE_URL}/api/users/${userEmail}`
            );
            setCurrentUserfollow(res.data);
        } catch (err) {
            console.error("โหลด Gmail currentUser ไม่ได้:", err);
        }
    };
    const handleFollow = async (targetEmail) => {
        await fetchGmailUser();
        if (!currentUserfollow || !Array.isArray(currentUserfollow.following)) {
            console.warn("currentUser ยังไม่พร้อม หรือ following ไม่มี");
            return;
        }

        const isFollowing = currentUserfollow.following.includes(targetEmail);
        const url = `${import.meta.env.VITE_APP_API_BASE_URL
            }/api/users/${userEmail}/${isFollowing ? "unfollow" : "follow"
            }/${targetEmail}`;
        const method = isFollowing ? "DELETE" : "POST";

        try {
            await axios({ method, url });
            await fetchGmailUser();
            toast.success("ติดตามสำเร็จ!");
        } catch (err) {
            console.error("Follow/unfollow error:", err);
            toast.error("ติดตามล้มเหลว!");
        }
    };
    return (
        <div className="profile-modal-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="profile-modal-body">
                    <div className="profile-modal-user">
                        <img
                            src={getHighResPhoto(
                                matchedUser?.photoURL || user.photoURL || userImage?.photoURL || userImage.image
                            )}
                            alt={matchedUser?.displayName || userImage?.displayName || "ผู้ใช้" || userImage.name || "ไม่มีชื่อ"}
                            className="profile-modal-avatar"
                        />
                        <div className="profile-modal-name">
                            {matchedUser?.displayName || userImage?.displayName || userImage?.name || "ไม่มีชื่อ"}
                        </div>
                        <div className="profile-modal-email">{userImage.email === userEmail ? userImage.usermatch : userImage.email}</div>
                    </div>
                    <div className="profile-modal-follow-info">
                        {isCom ? (
                            <ul className="show-com">
                                <li>
                                    <span className="Created">Created By : </span>
                                    <span className="Created-detail">{userImage.createdBy}</span>
                                </li>
                                <li>
                                    <span className="Created">Description : </span>
                                    <span className="Created-detail">{userImage.description}</span>
                                </li>
                            </ul>
                        ) : (
                            <div className="profile-modal-follow-info-details">
                                <div className="profile-modal-follow-info-header">
                                    <ul className="followers">
                                        <li>{followers.length} followers</li>
                                    </ul>
                                    <ul className="following">
                                        <li>{following.length} following</li>
                                    </ul>
                                </div>
                                <button
                                    className="chat-dropdown-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFollow(userImage.email);
                                    }}
                                >
                                    {Array.isArray(currentUserfollow?.following) &&
                                        currentUserfollow.following.includes(userImage.email)
                                        ? "กำลังติดตาม"
                                        : "ติดตาม"}
                                </button></div>
                        )}
                    </div>


                    <button
                        className="modal-profile"
                        onClick={() => deleteUser(userImage.roomId, userImage.email, userImage.name, userImage._id)}
                    >
                        ลบเพื่อน
                    </button>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </div>
    );
};

export default ProfileModal;
