import React from 'react'
import './ShowTitle.css'; // Assuming you have a CSS file for styling

const ShowTitle = ({ userimage }) => {
  return (
    <div>
      <div className="bg-title">
        {userimage && <img src={userimage} alt="User" />}
      </div>
    </div>
  )
}

export default ShowTitle
