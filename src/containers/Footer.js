import React from 'react'
import { CFooter } from '@coreui/react'

const TheFooter = () => {
  return (
    <CFooter fixed={false} style={{backgroundColor: '#fff'}}>
      {/* <div>
        <a href="https://coreui.io" target="_blank" rel="noopener noreferrer">CoreUI</a>
        <span className="ml-1">&copy; 2020 creativeLabs.</span>
      </div> */}
      <div className="mfs-auto">
        <span className="mr-1">Quill 2.0</span>
      </div>
    </CFooter>
  )
}

export default React.memo(TheFooter)
