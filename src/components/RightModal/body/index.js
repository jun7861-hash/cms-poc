import React from 'react'
import {
  CModalBody,
} from '@coreui/react'

const RightModalBody = ({ 
  children,
  tag,
  className,
  innerRef,
}) => {

  return (
    <>
			<CModalBody
        tag={tag}
        className={className}
        innerRef={innerRef}
      >
        {children}
      </CModalBody>
    </>
  )
}

export default RightModalBody