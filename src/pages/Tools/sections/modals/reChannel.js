import React from 'react'
import Modal from 'components/Modal'
import Select from 'react-select'

const ReChannel = ({
  show,
  toggle,
}) => {
  return (
    <Modal
      show={show}
      toggle={() => toggle()}
      closeText="Cancel"
      callbackText="Continue"
      headerText='Rechannel all/selected articles to'
      onCallback={() => console.log("rechannel click")}
      buttonType='info'
    >
      <Select
        isClearable
        isSearchable
        isMulti
      />
    </Modal>
  )
}

export default ReChannel
