import React from 'react'
import {
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CSpinner
} from '@coreui/react'
import './style.scss'

const Modal = ({
  bodyText, 
  headerText, 
  closeText, 
  callbackText, 
  closeButton = true,
  onCallback,
  show,
  toggle,
  children,
  buttonType,
  loading,
  className,
  closeOnBackdrop = true,
  size,
  disableCallBack
}) => {

  return (
    <CModal
      size={size}
      show={show}
      onClose={toggle}
      centered
      className={className}
      closeOnBackdrop={closeOnBackdrop}
    >
      <CModalHeader closeButton={closeButton} className="text-center">{headerText}</CModalHeader>
      <CModalBody className='position-relative'>
        {bodyText}
        {children}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => toggle()}>{closeText || 'Close'}</CButton>{' '}
        <CButton disabled={disableCallBack || loading} color={buttonType} onClick={() => onCallback()}>
          {callbackText || 'OK'}
          {loading && <CSpinner className='ml-2' size='sm' color="secondary" />}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

export default Modal
