import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CHeader,
  CToggler,
} from '@coreui/react'
import ImageLibraryModal from 'components/image-library-modal'
import * as masterActions from '../../../store/master/actions'

const TheHeader = () => {
  const dispatch = useDispatch();


  const toggleImage = () => {
    dispatch(masterActions.updateImageModal(!master.imageModal.open, null))
  }

  return (
    <>
    {/* 
      ADD MAIN IMAGE MODAL
    */}
      <ImageLibraryModal 
        // view={view}
        // columns={columns}
        // data={filterData(imageList)}
        selectImage
        show={master.imageModal.open}
        onClose={toggleImage}
      >
        <CInputGroup className='mb-3'>
          <CInput 
            placeholder="Search Item by Tags or Filename" 
            value={searchText} 
            onChange={(e) => setSearchText(e.target.value)}
          />
          <CInputGroupAppend>
            <CInputGroupText className='bg-info text-white'>
              <i className="material-icons" style={{cursor: 'default'}}>search</i>
            </CInputGroupText>
          </CInputGroupAppend>
        </CInputGroup>
      </ImageLibraryModal>
    </>
  )
}

export default TheHeader
