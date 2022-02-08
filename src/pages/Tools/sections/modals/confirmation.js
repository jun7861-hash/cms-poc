import React from 'react'

function confirmation() {
  return (
    <div>
          {/* confirmation modal */}
      {/* {
        confirmationModal &&
        <Modal
          show={confirmationModal}
          toggle={() => setConfirmationModal(!confirmationModal)}
          headerText={
            match.params.id ?
            'Are you sure you want to update this section?' :
            'Are you sure you want to create new section?'
          }
          closeText="Cancel"
          callbackText="Continue"
          onCallback={() => handleSave()}
          buttonType="danger"
          loading={isHandlingSave}
        >
          <div className="text-center">
            <h4>{data.section}</h4>
          </div>
        </Modal>
      } */}
    </div>
  )
}

export default confirmation
