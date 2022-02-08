import React from 'react'
import {
  CModalFooter,
} from '@coreui/react'

const RightModalFooter = ({
  children,
  tag,
  className,
  innerRef,
}) => {

  return (
    <>
      <CModalFooter
        tag={tag}
        className={className}
        innerRef={innerRef}
      >
        {children}
      </CModalFooter>
    </>
  )
}

export default RightModalFooter