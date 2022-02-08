import React from 'react'
import Modal from 'components/Modal'
const DisableModal = ({
  show,
  toggle,
  onCallback
}) => {
  return (
    <Modal
      show={show}
      toggle={() => toggle()}
      closeText="Cancel"
      callbackText="Continue"
      headerText=''
      onCallback={() => {
        toggle()
        onCallback()
      }}
      buttonType='info'
    >
      <div className="text-center">
        <p className='mb-0'>Are you sure you want to disable this section?</p>
      </div>
    </Modal>
  )
}

export default DisableModal
