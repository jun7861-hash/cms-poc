import React, { useState, useEffect } from 'react';
import Dropzone from 'react-dropzone-uploader';
// import Cropper from "react-cropper";
import {
  CCol,
  CRow,
  CProgress,
  CInput,
  CButton
} from '@coreui/react';
import 'react-dropzone-uploader/dist/styles.css'
import "cropperjs/dist/cropper.css";
import { addImage, getAllImage } from 'core/services/image_library';
import Modal from 'components/Modal';
const Preview = ({ meta }) => {
  const { name, percent, status } = meta
  return (
    <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
      {name}, {Math.round(percent)}%, {status}
    </span>
  )
}

const FileUploader = () => {
  const [preview, setPreview] = useState(false)
  const [isHandling, setIsHandling] = useState(false)
  const [stateMeta, setStateMeta] = useState()
  const [data, setData] = useState({
    image_id: 0,
    filename: '',
    photographer: '',
    illustrator: '',
    contributor_fee: '',
    tags: '',
    image: null,
  })

  const [addImageModal, setAddImageModal] = useState({
    open: false,
    data: {}
  });
  
  // eslint-disable-next-line
  const [alert, setAlert] = useState({
    show: false,
    text: '',
    type: ''
  })

  // eslint-disable-next-line
  const [isCrop, setIsCrop] = useState(false)
  // const [cropData, setCropData] = useState("#");
  // const [cropper, setCropper] = useState();

  // const getCropData = () => {
  //   if (typeof cropper !== "undefined") {
  //     setCropData(cropper.getCroppedCanvas().toDataURL());
  //   }
  //   console.log('cropxxx', cropData)
  // };

  const toggleAddImageModal = (type, data) => {
    if (type === 'addImageModal') {
      setAddImageModal({
        ...addImageModal,
        open: !addImageModal.open,
        data: data
      })
    }
  }

  const handleChange = (type, value) => {
    setData({
      ...data,
      [type]: value,
      filename: stateMeta && stateMeta.meta.name,
      image: stateMeta && stateMeta.file,
    })
  }

  

  const handleAddImage = async () => {
    setIsHandling(true)
    
    const payloadData = new FormData() 
    const {
      image_id,
      filename,
      photographer,
      illustrator,
      contributor_fee,
      tags,
      image
    } = data
    payloadData.append('image_id', image_id)
    payloadData.append('filename', filename)
    payloadData.append('photographer', photographer)
    payloadData.append('illustrator', illustrator)
    payloadData.append('contributor_fee', contributor_fee)
    payloadData.append('tags', tags)
    payloadData.append('image', image)

    try {
      let response = await addImage(payloadData)
      if (response.successful) {
        setAlert({
          open: true,
          text: response.message,
          type: 'success'
        })
        loadData()
      } else {
        setAlert({
          open: true,
          text: response.message,
          type: 'danger'
        })
      }
    } catch(error) {
      setAlert({
        open: true,
        text: error.message,
        type: 'danger'
      })
    }
    setIsHandling(false)
  }
  
  const handleRemove = () => {
    stateMeta && stateMeta.remove()
    setPreview(false)
  }
  
  const handleChangeStatus = (meta) => {
    setPreview(true)
    setStateMeta(meta)
    console.log(stateMeta)
  }

  const loadData = async () => {
    setIsHandling(true)
    await getAllImage();
    setIsHandling(false)
  }

  useEffect(() => {
    loadData()
  }, [stateMeta]);

  const currentSize = stateMeta && stateMeta.meta.size / 100000 
  const currentPercent = Math.round(stateMeta && stateMeta.meta.percent)
  
  return (
    <>
      <Dropzone
        onChangeStatus={handleChangeStatus}
        accept="image/*"
        inputContent="Drop/Select image"
        disabled={files => files.some(f => ['preparing', 'getting_upload_params', 'uploading'].includes(f.meta.status))}
        maxSizeBytes={500000}
        multiple={false}
        maxFiles={1}
        PreviewComponent={Preview}
      />

      {
        stateMeta ? (
          <div className={`${preview ? 'd-block' : 'd-none'} mt-3`}>
            <CRow className='mx-0'>
              <CCol sm='2' className='mb-2'>
                <img className='w-100 mb-1' src={stateMeta && stateMeta.meta.previewUrl} alt="images" />
                <div className='mb-2' style={{overflowX: 'scroll'}}>
                  <p className='text-center mb-0'>
                    {stateMeta && stateMeta.meta.name}
                  </p>
                </div>
                <CProgress animated striped color="info" value={currentPercent} className="mb-1 w-100 bg-white" />
                <p className='text-center'>{currentSize.toFixed(1) >= 1 ? currentSize.toFixed(1) : 'less than 1'}mb</p>
              </CCol>
              <CCol sm='8' className='mb-2'>
                <CRow className='mx-0'>
                  <CCol sm='6' className='mb-2'>  
                    <h5>Photographer</h5>
                    <CInput
                      value={data.photographer}
                      onChange={(e) => handleChange('photographer', e.target.value)}
                    />
                  </CCol>
                  <CCol sm='6' className='mb-2'>  
                    <h5>Illustrator</h5>
                    <CInput
                      value={data.illustrator}
                      onChange={(e) => handleChange('illustrator', e.target.value)}
                    />
                  </CCol>
                  <CCol sm='6' className='mb-2'>  
                    <h5>Contributor Fee</h5>
                    <CInput
                      value={data.contributor_fee}
                      onChange={(e) => handleChange('contributor_fee', e.target.value)}
                    />
                  </CCol>
                  <CCol sm='6' className='mb-2'>  
                    <h5>Tags</h5>
                    <CInput
                      value={data.tags}
                      onChange={(e) => handleChange('tags', e.target.value)}
                    />
                  </CCol>
                </CRow>
              </CCol>
              <CCol sm='2'>
                <div className='my-4'>
                  <CButton className='d-flex mb-3 w-100' size='md' color="secondary" /* onClick={() => setIsCrop(true)} */>
                    <p className="d-flex align-items-center material-icons m-0">crop</p>&nbsp;Crop
                  </CButton>
                  <CButton onClick={handleRemove} className='d-flex mb-3 w-100' size='md' color="danger">
                    <p className="d-flex align-items-center material-icons m-0">delete</p>&nbsp;Delete
                  </CButton>
                </div>
              </CCol>
            </CRow>
            <div className='justify-content-center'>
              <CButton 
                style={{margin: '0 auto'}}
                onClick={() => toggleAddImageModal('addImageModal', data)}
                className='d-flex mb-3'
                size='md'
                color="success"
              >
                <p className="d-flex align-items-center material-icons m-0">cloud_upload</p>&nbsp;Upload
              </CButton>
            </div>
          </div>
        ) : ''
      }

      
			{
				addImageModal.open &&
				<Modal
          closeOnBackdrop={false}
          className='_modal-override'
					loading={isHandling}
					show={addImageModal.open}
					toggle={() => toggleAddImageModal('addImageModal', null)}
					headerText="Are you sure to add image?"
					closeText="Cancel and go back to form"
					callbackText="Continue and add image"
					onCallback={() => handleAddImage()}
					buttonType='info'
				>
					<div className="text-center">
						<p>Filename: {data.filename}</p>
					</div>
				</Modal>
			}
    </>
  )
}

export default FileUploader
