import React from 'react'
import Modal from 'components/Modal'

const genericNotifModal = ({
  headerText,
  show,
  toggle,
  onCallback,
  bodyText
}) => {
  return (
    <Modal
      show={show}
      toggle={() => toggle()}
      closeText="Cancel"
      callbackText="Continue"
      // headerText='Rechanneled Articles'
      headerText={headerText}
      onCallback={() => onCallback()}
      buttonType='info'
    >
      <div className="text-center">
        <p>{bodyText}</p>
      </div>
    </Modal>
  )
}

export default genericNotifModal
