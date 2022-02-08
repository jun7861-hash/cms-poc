import React, { useState, useEffect } from 'react'
import {
  CFormGroup,
  CInputCheckbox,
  CLabel,
  CInput
} from '@coreui/react';
import {  useDispatch } from 'react-redux'
import { updatePermissionStatus } from 'core/services/user'
import * as masterActions from 'store/master/actions'
import Modal from 'components/Modal'
import RightModal from 'components/right-modal'

const PermissionModal = ({ 
  data,
  /* pre prop */
  innerRef,
  show,
  centered,
  backdrop,
  color,
  borderColor,
  onOpened,
  onClosed,
  fade,
  onClose,
}) => {
  const dispatch = useDispatch()
  const [permissionGroup, setPermissionGroup] = useState([])
  const [confirmationModal, setConfirmationModal] = useState(false)
  const [isHandlingSave, setIsHandlingSave] = useState(false)

  useEffect(() => {
    if (data && data.permissions) {
      setPermissionGroup(data.permissions)
    }
  }, [data])

  const handleSave = async () => {
    setIsHandlingSave(true)
    try {
      let res
      const updatedPermissions = permissionGroup.map((item) => {
        return {
          permission_id: item.permission_id,
          status: item.status
        }
      })
      res = await updatePermissionStatus({
        permissions: updatedPermissions
      })
      onClose()
      if (res.successful) {
        dispatch(masterActions.updateNotificationModal({
          open: true,
          type: 'success',
          bodyText: res.message,
          callback: async closeModal => {
            closeModal();
            window.location.href = '/permissions'
          }
        }))
      } else {
        dispatch(masterActions.updateNotificationModal({
          open: true,
          type: 'error',
          bodyText: res.message
        }))
      }
    } catch(error) {
      dispatch(masterActions.updateNotificationModal({
        open: true,
        type: 'error',
        bodyText: error
      }))
    }
    setIsHandlingSave(false)
  }

  const isChecked = (code) => {
    const isExist = permissionGroup.filter(item => item.code === code && item.status === 1)
    if (isExist.length > 0) {
      return true
    } else {
      return false
    }
  }

  const handleCheck = (code) => {
    if(isChecked(code)) {
      const newPermission = permissionGroup.map((item) => {
        if (item.code === code ) {
          return {...item, status: 0}
        } else {
          return item
        }
      })
      setPermissionGroup(newPermission)
    } else {
      const newPermission = permissionGroup.map((item) => {
        if (item.code === code ) {
          return {...item, status: 1}
        } else {
          return item
        }
      })
      setPermissionGroup(newPermission)
    }
  }

  const renderPermissions = (_data) => {
    let render;
    if (_data) {
      render = permissionGroup.map((item, index) => (
        <div key={index} className="mb-3">
          <CFormGroup variant="custom-checkbox" inline>
            <CInputCheckbox 
              id={item.code}
              custom 
              value={item.code}
              onChange={() => handleCheck(item.code)}
              checked={isChecked(item.code)}
            />
            <CLabel variant="custom-checkbox" htmlFor={item.code}>
            {item.code.replace(`${data.plugin}.`, '').replace('_', ' ')}
            </CLabel>
          </CFormGroup>
        </div>
      ))
    }
    return render
  }

  const isCheckedAll = permissionGroup.filter((p) => p.status === 0).length > 0 ? false : true

  const handleCheckAll = (isCheckedAll) => {
    if (isCheckedAll) {
      const newPermission = permissionGroup.map((item) => {
        return {...item, status: 0}
      })
      setPermissionGroup(newPermission)
    } else {
      const newPermission = permissionGroup.map((item) => {
        return {...item, status: 1}
      })
      setPermissionGroup(newPermission)
    }
  }


  return (
    <>
      <RightModal
        show={show}
        onClose={onClose}
        className='_modal-right edit-profile mb-3'
        innerRef={innerRef}
        centered={centered}
        backdrop={backdrop}
        color={color}
        borderColor={borderColor}
        onOpened={onOpened}
        onClosed={onClosed}
        fade={fade}
        saveButton='Save'
        footer
        handleSave={() => setConfirmationModal(!confirmationModal)}
      >
        <h4 className='mb-4'>Edit Permission</h4>
        <div>
          <div className="mb-4">
            <CLabel>
              Module name
            </CLabel>
            <CInput
                className='w-50'
                disabled
                readOnly
                value={data && data.plugin}
              />
          </div>
          <CFormGroup variant="custom-checkbox" inline className="mb-4">
            <CInputCheckbox 
              id="select-all"
              custom 
              onChange={() => handleCheckAll(isCheckedAll)}
              checked={isCheckedAll}
            />
            <CLabel variant="custom-checkbox" htmlFor="select-all">
              Select All
            </CLabel>
          </CFormGroup>
          { data && renderPermissions(data)}
        </div>
      </RightModal>
      {
        confirmationModal &&
        <Modal
          show={confirmationModal}
          toggle={() => setConfirmationModal(!confirmationModal)}
          headerText="Are you sure you want to update the permission of this module?"
          closeText="Cancel"
          callbackText="Continue"
          onCallback={() => handleSave()}
          buttonType="danger"
          loading={isHandlingSave}
        >
          <div className="text-center">
            <h4>{data.name}</h4>
            <p>{data && data.plugin} Module</p>
          </div>
        </Modal>
      }
    </>
  )
}

export default PermissionModal