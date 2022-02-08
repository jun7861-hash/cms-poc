import React from 'react'
import {
	CAlert,
} from '@coreui/react';
import './style.scss'

const Step = ({ 
	title,
	src,
	alt
}) => {
  return (
    <>
      <h5>Active Permissions</h5>
      <CAlert color="secondary" className='pl-2 pr-2 pt-0 pb-0'>
        <div className='_step'>
          <ul>
            <li><span>sample1</span></li>
            <li><span>sample1</span></li>
            <li><span>sample1</span></li>
          </ul>
        </div>
      </CAlert>
    </>
  )
}

export default Step