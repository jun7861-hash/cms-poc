import React, { useState, useEffect } from 'react'
import Dropzone from 'react-dropzone-uploader'
import {
	CInputGroup,
	CInputGroupAppend,
  CButton,
	CInput,
	CFormText,
} from '@coreui/react';
import { isNotEmptyObject } from 'core/helpers'
import defaultImg from 'assets/images/avatars/default_user_icon.png'
import './style.scss'

const CardProfile = ({
	currentUser,
	id,
	name,
	email,
	password,
	title,
	src,
	alt,
	image,
	updateImage
}) => {
	const [editable, setEditable] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [userData, setUserData] = useState(
		{
			author_slug: '',
			created_at: '',
			display_name: '',
			email: '',
			first_name: '',
			last_name: '',
			main_website: '',
			middle_initial: '',
			name: '',
			old_syndicate_id: '',
			role_id: '',
			secondary_website: '',
			status: '',
			updated_at: '',
			user_id: '',
		}
	)

	useEffect(() => {
    currentUser && isNotEmptyObject(currentUser) &&
    setUserData(currentUser)
  }, [currentUser])

	const toggleEditable = () => {
		setEditable(!editable)
	}

	const toggleShowPassword = () => {
		setShowPassword(!showPassword)
	}

	const handleChange = (type, value) => {
		setUserData({
			...userData,
			[type]: value
		})
	}

	// const getUploadParams = ({ meta }) => { return { url: 'https://httpbin.org/post' } }
	const handleChangeStatus = ({ file }) => { updateImage(file) }

  return (
    <div className="_card-profile">
			<Dropzone
				// getUploadParams={getUploadParams}
        onChangeStatus={handleChangeStatus}
        maxFiles={1}
        multiple={false}
        canCancel={false}
        inputContent="Drop A File"
        styles={{
          dropzone: { width: 400, height: 200 },
          dropzoneActive: { borderColor: 'green' },
        }}
			/>
			{/* <div className='d-flex' style={{justifyContent: 'center'}}>
				<div className='position-relative'>
					<div className='overlay-container w-50'>
            <Dropzone
              getUploadParams={getUploadParams}
							onChangeStatus={handleChangeStatus}
							onSubmit={handleSubmit}
              accept="image/*"
              maxSizeBytes={500000}
            />
						<img className='profile-image mb-3 w-100' src={image || defaultImg} alt="" />
						<p className='overlay-text p-1'>&#9432; &nbsp; Image should be 300x300px with a maximum file size of 1mb</p>
						<i className="edit-button material-icons">camera_enhance</i>
					</div>
				</div>
			</div> */}
			<div className='text-center'>
				<p className='m-0'><small>User ID: <strong>{userData.user_id}</strong></small></p>
				<h4 className='m-0'>{userData.name}</h4>
				<p className='mb-3'>{userData.email}</p>
				{/* <p className='mb-3'>{currentUser && currentUser.email}</p> */}
			</div>
			
			<h5>Password</h5>
			<div className='mb-5'>
				<CInputGroup>
					<CInput readOnly value={password} type={showPassword ? 'text' : 'password'} disabled={editable ? false : true} />
					<CInputGroupAppend>
						{editable ? (
							<>
								<CButton onClick={toggleShowPassword} type="button" color="secondary" variant='outline'>Show</CButton>
								<CButton type="button" color="success">Save</CButton>
							</>
						) : (
							''
						)}
						<CButton onClick={toggleEditable} type="button" color="secondary">{editable ? 'Cancel' : 'Edit'}</CButton>
					</CInputGroupAppend>
				</CInputGroup>
				<CFormText className="help-block">
					&#9432; &nbsp;
					Must be at least 8 characters with no spaces and contain at least 1 number.
				</CFormText>
			</div>
    </div>
  )
}

export default CardProfile