import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CImg,

  CCol,
  CRow,
  CSelect,
  CInput,
  CButton,
  CDataTable,
} from '@coreui/react'
import { useHistory } from "react-router-dom";
import CIcon from '@coreui/icons-react'
import DatePicker from 'components/date-picker'
import RightModal from 'components/right-modal'
import ProfileModal from 'components/profile-modal'
import defaultImg from 'assets/images/avatars/default_user_icon.png'

// routes config
import * as actions from 'store/master/actions'

//core services
import { signOut } from 'core/services/auth'

const TheHeaderDropdown = () => {
  const history = useHistory()
	const dispatch = useDispatch()
  const master = useSelector(state => state.master)
  
  // temporary
  const [syndicateDateRange, setSyndicateDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'syndicateSelection',
    }
  ]);

  const usersData = [
    {id: 0, criteria: 'John Doe', score: '0'},
    {id: 1, criteria: 'John Doe', score: '0'},
    {id: 2, criteria: 'John Doe', score: '0'},
    {id: 3, criteria: 'John Doe', score: '0'},
    {id: 4, criteria: 'John Doe', score: '0'},
  ];

  const fields = [
    { key: 'criteria',_style: { width: '80%'} },
    { key: 'score',_style: { width: '20%'} },
  ]
 
  const toggleProfile = ()=>{
		dispatch(actions.updateProfileModal(!master.profileModal.open, null))
  }
 
  const toggleSyndicate = ()=>{
    dispatch(actions.updateSyndicateModal(!master.syndicateModal.open, null))
  }
 
  const toggleCheckSEO = ()=>{
		dispatch(actions.updateSEOScoreModal(!master.SEOScoreModal.open, null))
  }

  useEffect(() => {
		// console.log(syndicateDateRange[0])
  }, [syndicateDateRange])
  

  const handleSignOut = async () => {
    signOut();
  }

  return (
    <>
      {/* PROFILE MODAL  */}
      <ProfileModal
        show={master.profileModal.open}
        onClose={toggleProfile}
      />
      
      {/*  SYNDICATE MODAL */}
      <RightModal
        show={master.syndicateModal.open}
        onClose={toggleSyndicate}
        hasSaveButton
        titleSaveButton='Add To Content'
        closeButton
        hasFooter={false}
      >
        
        <h4>Syndicate Article</h4>
        <CRow className='mb-3'>
          <CCol sm='12'>
            <DatePicker
              isRange
              editableDateInputsR={true}
              onChangeR={item => setSyndicateDateRange([item[0].syndicateSelection])}
              rangesR={syndicateDateRange}
              months={2}
            />
          </CCol>
        </CRow>

        <CRow className='mb-3'>
          <CCol sm='3'>
            <CSelect
              required
            >
              <option value="1">Option #1</option>
              <option value="2">Option #2</option>
              <option value="3">Option #3</option>
            </CSelect>
          </CCol>
          <CCol sm='6'>
            <CInput
              type="text"
            />
          </CCol>
          <CCol sm='3'>
            <CButton
              color='info'
              className='w-100'
            >
              Search
            </CButton>
          </CCol>
        </CRow>
      </RightModal>
      
      {/*  CHECK SEO MODAL */}
      <RightModal
        show={master.SEOScoreModal.open}
        onClose={toggleCheckSEO}
        hasSaveButton
        titleSaveButton='Save Changes'
        closeButton
      >
        <h4>Keyword</h4>
        <CInput
          className='mb-5'
          type="text"
          disabled
        />

        <CDataTable
          clickableRows={true}
          items={usersData}
          fields={fields}
          hover
        />
      </RightModal>
      
      <CDropdown
        inNav
        className="c-header-nav-items mr-2"
        direction="down"
      >

      <CDropdownToggle className="c-header-nav-link" caret={false}>
        <div className="c-avatar">
          <CImg
            src={defaultImg}
            className="c-avatar-img"
            alt="admin@bootstrapmaster.com"
          />
        </div>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem
          header
          tag="div"
          color="light"
          className="text-center"
        >
          <strong>{master.currentUser && master.currentUser.display_name}</strong>
        </CDropdownItem>
        <CDropdownItem onClick={toggleProfile}>
          <CIcon name="cil-user" className="mfe-2" />Profile
        </CDropdownItem>
        {/* <CDropdownItem>
          <CIcon name="cil-settings" className="mfe-2" />
          Settings
        </CDropdownItem> */}
        <CDropdownItem className="text-dark" onClick={() => handleSignOut()}>
          <CIcon name="cil-lock-locked" className="mfe-2" />
          Sign out
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
    </>
  )
}

export default TheHeaderDropdown
