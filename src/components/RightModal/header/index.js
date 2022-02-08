import React from 'react'
import {
  CModalHeader,
} from '@coreui/react'

const RightModalHeader = ({
  tag,
  children,
  className,
  innerRef,
  closeButton,
}) => {

  return (
    <>
      <CModalHeader
        tag={tag}
        className={className}
        innerRef={innerRef}
        closeButton={closeButton}
      >
        {children}
      </CModalHeader>
    </>
  )
}

export default RightModalHeader