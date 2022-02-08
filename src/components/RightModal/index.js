import React from 'react'
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalTitle,
  CModalFooter,
} from '@coreui/react'
import './style.scss'

const RightModal = ({ 
  /* new prop */
  hasTitle = true,
  hasFooter = true,
  title,
  footer,

  /* pre prop */
  children,
  className,
  innerRef,
  show,
  centered,
  size,
  backdrop,
  color,
  borderColor,
  onOpened,
  onClosed,
  fade,
  closeOnBackdrop,
  onClose,
  addContentClass,
  closeButton,
}) => {
  
  // useEffect(() => {
  //   document.body.style.overflow = show ? 'hidden' : 'inherit'
  // }, [show])

  return (
    <>
      <CModal
        className={`_modal-right ${className}`}
        innerRef={innerRef}
        show={show}
        centered={centered}
        size={size}
        backdrop={backdrop}
        color={color}
        borderColor={borderColor}
        onOpened={onOpened}
        onClosed={onClosed}
        fade={fade}
        closeOnBackdrop={closeOnBackdrop}
        onClose={onClose}
        addContentClass={addContentClass}
      >
        <CModalHeader closeButton={closeButton}>        
          {hasTitle && (
            <CModalTitle>{title}</CModalTitle>
          )}
        </CModalHeader>
        <CModalBody>
          {children}
        </CModalBody>
        {hasFooter && (
          <CModalFooter>{footer}</CModalFooter>
        )}
      </CModal>
    </>
  )
}

export default RightModal