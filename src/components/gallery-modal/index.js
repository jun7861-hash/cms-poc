import React, { useState, useEffect } from 'react';
import {
	CDataTable,
	CFormGroup,
	CInputRadio
} from '@coreui/react';

import RightModal from '../../components/right-modal';

const GalleryModal = ({ 
  /* datatable */
	items,
	fields,
  /* pre prop */
  children,
  className,
  onClose,
  innerRef,
  show,
  centered,
  backdrop,
  color,
  borderColor,
  onOpened,
  onClosed,
  fade,
  closeOnBackdrop,
  addContentClass,
}) => {

  return (
    <>
			{children}
      <RightModal
				// default
        size='lg'
        hasSaveButton
        titleSaveButton='Add To Content'
				closeButton
				hasFooter={false}
				// to be pass
        onClose={onClose}
        show={show}
				className={`mt-3 ${className}`}
				innerRef={innerRef}
				centered={centered}
				backdrop={backdrop}
				color={color}
				borderColor={borderColor}
				onOpened={onOpened}
				onClosed={onClosed}
				fade={fade}
				closeOnBackdrop={closeOnBackdrop}
				addContentClass={addContentClass}
      >
        <h4 className='mb-3'>Image Gallery</h4>
        <CDataTable
          items={items}
          fields={fields}
          tableFilter
          itemsPerPageSelect
          itemsPerPage={5}
          hover
          pagination
          scopedSlots = {
            {'action':
              (item)=>(
                <td>
                  <CFormGroup variant="checkbox">
                    <CInputRadio className="form-check-input" name='galleryRadio' value={item.id} selected={item.action} />
                  </CFormGroup>
                </td>
              ),
            }
          }
        />
      </RightModal>
    </>
  )
}

export default GalleryModal