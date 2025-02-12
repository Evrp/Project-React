import React from 'react'
import "./Profile.css"
const Profile = () => {
  return (
    <div className="profile">
      <div className="img">
        <img
          src="src\assets\422886373_1683226912080778_4239286224267270788_n 1 (2).svg"
          alt="TypeScript Logo"
        />
      </div>
      <div className="cardname">
        <div className="name">
          <h1>BradinlnwZa007</h1>
        </div>
        <div className="name-th">
          <p>ภูบดินทร์ คนชม</p>
        </div>
        <div className="age">
          <p>อายุ 21</p>
          <div className="type">
            <p>ENFP-A Social Introvert</p>
          </div>
          <div className="divjob">
            <p>งานอดิเรก</p>
          </div>
        </div>
        <div className="box">
          <p>Message</p>
        </div>
      </div>
    </div>
  )
}

export default Profile
