import React from 'react'
import './style.scss'

const Loading = ({loading}) => {
  return (
    <div className={`loading-spinner ${loading ? 'd-block' : 'd-none'}`}></div>
  )
}

export default Loading
