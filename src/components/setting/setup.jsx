import React from 'react'
import RequireLogin from '../ui/RequireLogin'
const setup = () => {
  return (
    <RequireLogin>
      <div className="pd-10">
        Setting
      </div>
      </RequireLogin>
  )
}

export default setup
