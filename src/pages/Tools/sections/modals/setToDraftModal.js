import React from 'react'
import Modal from 'components/Modal'
const SetToDraftModal = ({
  show,
  toggle,
  onCallback,
  isSaving
}) => {
  return (
    <Modal
      show={show}
      toggle={() => toggle()}
      closeText="Cancel"
      callbackText="Continue"
      headerText=''
      onCallback={() => onCallback()}
      buttonType='info'
      loading={isSaving}
    >
      <div className="text-center">
        <p className='mb-0'>Are you sure you want to set all articles back to draft?</p>
      </div>
    </Modal>
  )
}

export default SetToDraftModal
