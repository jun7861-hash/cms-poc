import React, { useEffect } from 'react'
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  CSpinner
} from '@coreui/react'
import './style.scss';

const RightModal = ({ 
  /* new prop */
  saveButton = true,
  footer,

  /* pre prop */
  children,
  className,
  innerRef,
  show,
  centered,
  size = '',
  backdrop,
  color,
  borderColor,
  onOpened,
  onClosed,
  fade,
  onClose,
  addContentClass,
  handleSave,
  isLoading,
  saveColor = 'info',
  disabled,
  customSize,
  hasSaveButton = true,
  closeButton = true
}) => {

  // useEffect(() => {
  //   document.body.style.overflow = show ? 'hidden' : 'inherit';
  // }, [show]);

  return (
    <>
      <CModal
        className={`_modal-right ${customSize} ${className}`}
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
        closeOnBackdrop={false}
        onClose={onClose}
        addContentClass={addContentClass}
      > 
        <div style={{backgroundColor: '#fff'}}>
          <CModalHeader className='py-1' closeButton={closeButton} style={{flexDirection: hasSaveButton ? 'row-reverse' : 'column'}}>        
            {
              hasSaveButton ?
              saveButton && handleSave ?
                (
                  <CButton disabled={disabled} className='d-block mb-0' color={saveColor} onClick={() => handleSave()}>
                    {saveButton}
                    {isLoading && <CSpinner className='ml-2' size='sm' color="secondary" />}
                  </CButton>
                ) :
                (
                  <CButton disabled={disabled} className='d-block mb-0' color="info" onClick={() => handleSave()}>
                    {saveButton}
                  </CButton>
                )
            : null
            }
          </CModalHeader>
          <CModalBody className="pb-5">
            {children}
          </CModalBody>
          <CModalFooter className={`${footer ? 'd-flex' : 'd-none'}`}>{footer}</CModalFooter>
        </div>

      </CModal>
    </>
  )
}

export default RightModal