import React, { useState } from 'react'
import { 
  CLabel,
  CInput,
  CRow,
  CCol,
  CCardBody,
  CCard,
  CCardHeader,
  CButton
} from '@coreui/react'
import Select from 'react-select'

const UserFormModal = () => {
  const [data, setData] = useState({
    first_name: '',
    middle_initial: '',
    last_name: '',
    email: '',
    role_id: '',
    status: '',
    display_name: '',
    author_slug: '',
    old_syndicate_id: '',
    main_website: '',
    secondary_website: ''
  })
  const roles = [
    {
      value: '5',
      label: 'Technical Admin'
    },
    {
      value: '1',
      label: 'Admin'
    },
    {
      value: '4',
      label: 'Editor'
    },
    {
      value: '3',
      label: 'Contributor'
    },
    {
      value: '2',
      label: 'Author'
    },
  ]

  // const getRole = (res) => {
  //   const roles = {
  //     1: "Admin",
  //     2: "Author",
  //     3: "Contributor",
  //     4: "Editor",
  //     5: "Technical Admin",
  //   };
  //   return roles.hasOwnProperty(res) && roles[res];
  // }
  
  const handleOnChange = (type, value) => {
		setData({
			...data,
			[type]: value
		})
  }
  
  const handleSave = () => {
    alert(JSON.stringify(data))
  }

  return (
    <>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <h5 className="float-left pt-2">Create New User</h5>
              <CButton 
                color="info" 
                className='mx-2 px-4 float-right'
                size='md'
                onClick={() => handleSave()}
              >
                Save
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CRow className="px-3">
                <CCol lg="6">
                  <CLabel><span className="text-danger mr-1">*</span>Email Address</CLabel>
                  <CInput
                    value={data.email} 
                    onChange={(e) => handleOnChange('email', e.target.value)}
                    type="email" 
                    className="mb-3" 
                    placeholder="Enter Email Address"
                  />
                </CCol>
                <CCol lg="6">
                  <CLabel><span className="text-danger mr-1">*</span>Main Website</CLabel>
                  <CInput
                    value={data.main_website} 
                    onChange={(e) => handleOnChange('main_website', e.target.value)}
                    type="text" 
                    className="mb-3" 
                    placeholder="Enter Main Website"
                  />
                </CCol>
              </CRow>
              <CRow className="px-3">
                <CCol lg="6">
                  <CLabel><span className="text-danger mr-1">*</span>First Name</CLabel>
                  <CInput
                    value={data.first_name} 
                    onChange={(e) => handleOnChange('first_name', e.target.value)}
                    type="text" 
                    className="mb-3" 
                    placeholder="Enter First Name"
                  />
                </CCol>
                <CCol lg="6">
                  <CLabel><span className="text-danger mr-1">*</span>Secondary Website</CLabel>
                  <CInput
                    value={data.secondary_website} 
                    onChange={(e) => handleOnChange('secondary_website', e.target.value)}
                    type="text" 
                    className="mb-3" 
                    placeholder="Enter Secondary Website"
                  />
                </CCol>
              </CRow>
              <CRow className="px-3">
                <CCol lg="6">
                  <CLabel><span className="text-danger mr-1">*</span>Middle Initial</CLabel>
                  <CInput
                    value={data.middle_initial} 
                    onChange={(e) => handleOnChange('middle_initial', e.target.value)}
                    type="text" 
                    className="mb-3" 
                    placeholder="Enter Middle Initial"
                  />
                </CCol>
                <CCol lg="6 mb-3">
                  <CLabel><span className="text-danger mr-1">*</span>Status</CLabel>
                  <Select
                    value={data.status} 
                    onChange={(value) => handleOnChange('status', value.value)}
                    options={[
                      {
                        value: 1,
                        label: "Active"
                      },
                      {
                        value: 0,
                        label: "Inactive"
                      }
                    ]} 
                    placeholder="Select Status"
                    components={{
                      IndicatorSeparator: () => null
                    }}
                    isSearchable={false}
                    isClearable
                  />
                </CCol>
              </CRow>
              <CRow className="px-3">
                <CCol lg="6">
                  <CLabel><span className="text-danger mr-1">*</span>Last Name</CLabel>
                  <CInput
                    value={data.last_name} 
                    onChange={(e) => handleOnChange('last_name', e.target.value)}
                    type="text" 
                    className="mb-3" 
                    placeholder="Enter Last Name"
                  />
                </CCol>
                <CCol lg="6">
                  <CLabel>Old Syndicate ID</CLabel>
                  <CInput
                    value={data.old_syndicate_id} 
                    onChange={(e) => handleOnChange('old_syndicate_id', e.target.value)}
                    type="text" 
                    className="mb-3" 
                    placeholder="Enter Old Syndicate ID"
                  />
                </CCol>
              </CRow>
              <CCol lg="6">
                <CLabel><span className="text-danger mr-1">*</span>Author Slug</CLabel>
                <CInput
                  value={data.author_slug} 
                  onChange={(e) => handleOnChange('author_slug', e.target.value)}
                  type="text" 
                  className="mb-3" 
                  placeholder="Enter Author Slug"
                />
              </CCol>
              <CCol lg="6 mb-3">
                <CLabel><span className="text-danger mr-1">*</span>Role</CLabel>
                <Select
                 value={data.role_id} 
                 onChange={(value) => handleOnChange('role_id', value.value)}
                  options={roles} 
                  placeholder="Select Role"
                  components={{
                    IndicatorSeparator: () => null
                  }}
                  isSearchable={false}
                  isClearable
                />
              </CCol>
              <CCol lg="6">
                <CLabel><span className="text-danger mr-1">*</span>Display Name</CLabel>
                <CInput
                 value={data.display_name} 
                 onChange={(e) => handleOnChange('display_name', e.target.value)}
                  type="text" 
                  className="mb-3" 
                  placeholder="Enter Display Name"
                />
              </CCol>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default UserFormModal
