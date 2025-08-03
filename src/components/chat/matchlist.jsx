import { useEffect, useState, useRef } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { FaHeart } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
const MatchList = ({
  allEvents,
  setActiveUser,
  setRoombar,
  users,
  setIsGroupChat,
  isOpenMatch,
  setIsOpenMatch,
  setSelectedTab,
  setOpenchat,
  handleProfileClick,
  userMatchData,
  selectedTab,
  openMenuFor,
  setUserImage,
  infos,
  setOpenMenuFor,
}) => {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");
  const dropdownRefs = useRef({});
  const [loadingRoomId, setLoadingRoomId] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedData, setMatchedData] = useState(null);

  const handleEnterRoom = (roomId) => {
    navigate(`/chat/${roomId}`);
  };


  // ตรวจสอบการ match ใหม่
  useEffect(() => {
    if (userMatchData && userMatchData.length > 0) {
      const newMatches = userMatchData.filter(match =>
        match.emailjoined && match.usermatchjoined &&
        (match.email === userEmail || match.usermatch === userEmail)
      );

      // ถ้ามี match ใหม่ แสดง modal (สามารถเพิ่ม localStorage เพื่อเก็บสถานะว่าเคยแสดงแล้วหรือไม่)
      if (newMatches.length > 0 && !localStorage.getItem(`match_shown_${newMatches[0]._id}`)) {
        setMatchedData(newMatches[0]);
        setShowMatchModal(true);
        localStorage.setItem(`match_shown_${newMatches[0]._id}`, 'true');
      }
    }
  }, [userMatchData, userEmail]);

  const closeMatchModal = () => {
    setShowMatchModal(false);
    setMatchedData(null);
  };

  // ปิด dropdown เมื่อคลิกนอก dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuFor) {
        const currentDropdown = dropdownRefs.current[openMenuFor];
        if (currentDropdown && !currentDropdown.contains(event.target)) {
          setOpenMenuFor(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, [openMenuFor, userMatchData]);

  return (
    <div className="favorite-container">
      <div
        className="favorite-toggle"
        onClick={() => setIsOpenMatch((prev) => !prev)}
      >
        {isOpenMatch ? <FaChevronDown /> : <FaChevronRight />}
        <span>Match</span>
      </div>
      {isOpenMatch && (
        <div
          className={!isOpenMatch ? "group-container-open" : "group-container"}
        >
          <ul className="friend-list-chat">
            {userMatchData
              .filter((matchData) => {
                // เช็คว่า email หรือ usermatch ตรงกับ userEmail ปัจจุบัน
                const isUserInMatch = matchData.email === userEmail || matchData.usermatch === userEmail;
                // เช็คว่าทั้งคู่ join แล้ว
                const bothJoined = matchData.emailjoined === true && matchData.usermatchjoined === true;
                // เช็ค _id ด้วย
                const hasValidId = !!matchData._id;

                return isUserInMatch && bothJoined && hasValidId;
              })
              .map((matchData, index) => {

                // หา email ของคู่แมตช์ (คนที่ไม่ใช่เรา)
                const partnerEmail = matchData.email === userEmail ? matchData.usermatch : matchData.email;
                const user = users.find((u) => u.email === partnerEmail);
                return (
                  <li
                    key={`${matchData._id}-${index}`}
                    className={`chat-match-item ${selectedTab === matchData._id ? 'selected' : ''}`}
                    onClick={() => {
                      // ตรวจสอบข้อมูลก่อน navigate
                      if (!matchData._id) {
                        console.error('matchData._id is undefined:', matchData);
                        return;
                      }

                      // ใช้ _id ของ matchData สำหรับ navigation
                      navigate(`/chat/${matchData._id}`);
                      setOpenchat(true);
                      setUserImage(matchData);
                      setSelectedTab(matchData._id);

                      setActiveUser(partnerEmail); // ส่ง email ของคู่แมตช์เป็น activeUser

                      // หา user object สำหรับ setRoombar
                      const partnerUser = users.find(u => u.email === partnerEmail);
                      setRoombar(partnerUser?.photoURL || matchingRoom.image, matchingRoom.title);
                      setIsGroupChat(false);

                      // หา user object จาก users array เพื่อส่งให้ handleProfileClick
                      const userObject = users.find(u => u.email === partnerEmail) || { email: partnerEmail };
                      handleProfileClick(userObject);
                    }}
                  >
                    <img
                      src={(() => {
                        const user = users.find((u) => u.email === partnerEmail);
                        return user && user.photoURL
                          ? user.photoURL
                          : "/default-profile.png";
                      })()}
                      alt={matchData.detail}
                      className="friend-photo"
                    />
                    <div className="match-detail">
                      <span className="friend-name">
                        {(() => {
                          const user = users.find((u) => u.email === partnerEmail);
                          return user && user.displayName
                            ? user.displayName
                            : partnerEmail;
                        })()}
                      </span>
                      <span className="friend-title">{matchData.detail}</span>

                      {/* แสดง Match Badge เมื่อทั้งคู่ join แล้ว */}
                      {matchData.emailjoined && matchData.usermatchjoined && (
                        <div className="match-badge">
                          <FaHeart className="match-icon" />
                          <span className="match-text">It's a Match!</span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {/* Match Modal Popup */}
      {showMatchModal && matchedData && (
        <div className="match-modal-overlay" onClick={closeMatchModal}>
          <div className="match-modal" onClick={(e) => e.stopPropagation()}>
            <div className="match-modal-content">
              <div className="match-celebration">
                <FaHeart className="big-heart-icon" />
                <h2 className="match-title">It's a Match!</h2>
                <p className="match-subtitle">You and {(() => {
                  const partnerEmail = matchedData.email === userEmail ? matchedData.usermatch : matchedData.email;
                  const partnerUser = users.find(u => u.email === partnerEmail);
                  return partnerUser?.displayName || partnerEmail;
                })()} liked each other</p>
              </div>

              <div className="match-users">
                <div className="match-user">
                  <img
                    src={users.find(u => u.email === userEmail)?.photoURL || "/default-profile.png"}
                    alt="You"
                    className="match-avatar"
                  />
                </div>
                <div className="match-hearts">
                  <FaHeart className="floating-heart heart-1" />
                  <FaHeart className="floating-heart heart-2" />
                  <FaHeart className="floating-heart heart-3" />
                </div>
                <div className="match-user">
                  <img
                    src={(() => {
                      const partnerEmail = matchedData.email === userEmail ? matchedData.usermatch : matchedData.email;
                      const partnerUser = users.find(u => u.email === partnerEmail);
                      return partnerUser?.photoURL || "/default-profile.png";
                    })()}
                    alt="Match"
                    className="match-avatar"
                  />
                </div>
              </div>

              <div className="match-actions">
                <button
                  className="match-btn chat-btn"
                  onClick={() => {
                    navigate(`/chat/${matchedData._id}`);
                    setOpenchat(true);
                    setUserImage(matchedData);
                    closeMatchModal();
                  }}
                >
                  Start Chatting
                </button>
                <button className="match-btn keep-btn" onClick={closeMatchModal}>
                  Keep Swiping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchList;
