import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useChatStore } from '../../lib/chatSrore';
import { useUserStore } from '../../lib/userStore';

const List = () => {
  const { changeChat } = useChatStore();
  const { currentUser } = useUserStore();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const list = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== currentUser.id) {
          list.push(doc.data());
        }
      });
      setUsers(list);
    };

    getUsers();
  }, []);

  return (
    <div className="user-list">
      {users.map(user => (
        <div
          key={user.id}
          className="user-card"
          onClick={() => {
            const chatId = currentUser.id > user.id
              ? currentUser.id + user.id
              : user.id + currentUser.id;
            changeChat(chatId, user);
          }}
        >
          <img src={user.photo} alt="" />
          <p>{user.name}</p>
        </div>
      ))}
    </div>
  );
};

export default List;
