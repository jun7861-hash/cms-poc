import React from 'react'
import {
    CModalTitle,
} from '@coreui/react'

const RightModalFooter = ({
  children,
  tag,
  className,
  innerRef,
}) => {

  return (
    <>
      <CModalTitle
        tag={tag}
        className={className}
        innerRef={innerRef}
      >
        {children}
      </CModalTitle>
    </>
  )
}

export default RightModalFooter