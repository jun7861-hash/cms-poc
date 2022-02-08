import React, { useState } from 'react';
import DatePickerr from "react-datepicker";
import { 
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CButton
} from '@coreui/react';
import "react-datepicker/dist/react-datepicker.css";

const DatePicker = ({
  onChange,
  selected,
}) => {
  // hide/show date picker
	const [showPicker, setShowPicker] = useState(false);
  // value of input date
  const date = selected?.toLocaleDateString();

  return (
      <>
        <div className='position-relative'>
				  <CInputGroup onClick={() => setShowPicker(true)} className='mb-1'>
            <CInputGroupPrepend>
              <CInputGroupText>
                <i className="material-icons" style={{fontSize: '1.25rem'}}>today</i>
              </CInputGroupText>
            </CInputGroupPrepend>
            <CInput
              type="text" 
              readOnly
              value={date}
            />
          </CInputGroup>
          
          <div 
            style={{
              right: '0',
              zIndex: '50',
              position: 'absolute',
              backgroundColor: '#fff',
              borderRadius: '.5rem',
              border: 'solid 1px #eee'
            }} 
            className={showPicker ? 'd-block p-2 mb-2' : 'd-none'}
          >
            <DatePickerr
              minDate={new Date()}
              selected={selected}
              onChange={onChange}
              inline
            />
            <div className='d-flex justify-content-end'>
              <CButton size='sm' type="button" color="info" className='py-0 mx-1'>
                Apply
              </CButton>
              <CButton onClick={() => setShowPicker(false)} size='sm' type="button" color="secondary" className='py-0 mx-1'>
                Cancel
              </CButton>
            </div>
          </div>
        </div>
      </>
  );
};

export default DatePicker;
