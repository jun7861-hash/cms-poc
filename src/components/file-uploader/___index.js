import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactCrop from 'react-image-crop';
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import Dropzone from 'react-dropzone-uploader';
import {
  CCol,
  CRow,
  CProgress,
  CInput,
  CButton
} from '@coreui/react';
import 'react-dropzone-uploader/dist/styles.css'
import 'react-image-crop/dist/ReactCrop.css';
import { addImage, getAllImage } from 'core/services/image_library';
import Modal from 'components/Modal';
import { isNotEmptyArray } from 'core/helpers';
const Preview = ({meta}) => {
  const { name, percent, status } = meta
  return (
    <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
      {name}, {Math.round(percent)}%, {status}
    </span>
  )
}

const FileUploader = () => {
  const [isHandling, setIsHandling] = useState(false)
  const [stateMeta, setStateMeta] = useState()
  const [data, setData] = useState([{
    image_id: 0,
    filename: '',
    photographer: '',
    illustrator: '',
    contributor_fee: '',
    tags: '',
    image: null,
  }])
  const [uploadData, setUploadData] = useState([])

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

  //CROPxx
  // eslint-disable-next-line
  const [isCrop, setIsCrop] = useState(false)
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState({ unit: '%', width: 100, aspect: 0 });
  const [completedCrop, setCompletedCrop] = useState(null);

  const onLoad = useCallback((img) => {
    imgRef.current = img;
    console.log(imgRef.current)
  }, []);


  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), 
        n = bstr.length, 
        u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  const getCropImage = (canvas, crop, itemId) => {
    if (!crop || !canvas) {
      return;
    }
    const base64Image = canvas.toDataURL('image/jpeg');
    setUploadData(uploadData.map(x => {
      if(x.filename !== itemId) {
        return x
      } else {
        const file = dataURLtoFile(base64Image, x.filename)
        return {...x, image: file, previewUrl: base64Image}
      }    
    }))
  }

  const croppingImage = (itemId) => {
    setUploadData(uploadData.map(x => {
      if(x.filename !== itemId) {
        return {...x, isCrop: false}
      } else {
        return {...x, isCrop: true}
      }    
    }))
  }

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    console.log(completedCrop)
  }, [completedCrop]);

  const toggleAddImageModal = (type, data) => {
    if (type === 'addImageModal') {
      setAddImageModal({
        ...addImageModal,
        open: !addImageModal.open,
        data: data
      })
    }
  }

  const handleChange = (prop, event, index) => {
    const old = uploadData[index];
    const updated = { ...old, [prop]: event.target.value }
    const clone = [...uploadData];
    clone[index] = updated;
    setUploadData(clone);
}

  const handleAddImage = async () => {
    setIsHandling(true)
    try {
      await Promise.all(uploadData.map(async (i) => {
        const payloadData = new FormData() 
        payloadData.append('filename', i.filename)
        payloadData.append('photographer', i.photographer)
        payloadData.append('illustrator', i.illustrator)
        payloadData.append('contributor_fee', i.contributor_fee)
        payloadData.append('tags', i.tags)
        payloadData.append('image', i.image)
        let response = await addImage(payloadData)
        console.log(response)
        loadData()
        if (response.successful) {
          setAlert({
            open: true,
            text: response.message,
            type: 'success'
          })
        } else {
          setAlert({
            open: true,
            text: response.message,
            type: 'danger'
          })
        }
        return response.data.data
      }));
    } catch(error) {
      setAlert({
        open: true,
        text: error.message,
        type: 'danger'
      })
    }
    setIsHandling(false)
  }
    
  const handleRemove = (id) => {
    const tempArray = [...uploadData];
    tempArray.splice(id, 1); 
    setUploadData(tempArray);

  }

  
  const handleChangeStatus = (meta) => {
    setStateMeta(meta)
    // const isExist = uploadData.some(s => s.id === meta.meta.id || s.filename === meta.meta.name) 
    const size = meta.meta.size / 100000
    const isDone = meta.meta.status === "done"
    if (isDone) {
      setUploadData(uploadData => ([
        ...uploadData,
        {
          filename: meta.meta.name,
          image: meta.file,
          previewUrl: meta.meta.previewUrl,
          size: size.toFixed(1),
          percent: Math.round(meta.meta.percent),
          photographer: '',
          illustrator: '',
          contributor_fee: 0,
          tags: '',
          remove: meta.remove,
          isCrop: false
        }
      ]))
    }
  }

  const loadData = async () => {
    setIsHandling(true)
    await getAllImage();
    setIsHandling(false)
  }

  useEffect(() => {
    loadData()
    
    console.log(uploadData)
  }, [uploadData, ]);

  
  return (
    <>
      <div className={isCrop ? 'd-none' : 'd-block'}>
        <Dropzone
          onChangeStatus={handleChangeStatus}
          accept="image/*"
          inputContent="Drop/Select image"
          disabled={files => files.some(f => ['preparing', 'getting_upload_params', 'uploading'].includes(f.meta.status))}
          maxSizeBytes={500000}
          maxFiles={5}
          PreviewComponent={Preview}
        />
      </div>

      {
        stateMeta ? (
          <div className='d-block mt-3'>
            {
              uploadData.map((d, index) => (
                <>
                  <CRow className={`mx-0 ${isCrop ? 'd-none': 'd-flex'}`} key={index}>
                    <CCol sm='2' className='mb-2'>
                      <img className='w-100 mb-1' src={d.previewUrl} alt="images" />
                      <div className='mb-2' style={{overflowX: 'scroll'}}>
                        <p className='text-center mb-0'>
                          {d.filename}
                        </p>
                      </div>
                      <CProgress animated striped color="info" value={d.percent} className="mb-1 w-100 bg-white" />
                      <p className='text-center'>{d.size >= 1 ? d.size : 'less than 1'}mb</p>
                    </CCol>
                    <CCol sm='8' className='mb-2'>
                      <CRow className='mx-0'>
                        <CCol sm='6' className='mb-2'>  
                          <h5>Photographer</h5>
                          <CInput
                            value={d.photographer}
														onChange={(e) => handleChange('photographer', e, index)}
                          />
                        </CCol>
                        <CCol sm='6' className='mb-2'>  
                          <h5>Illustrator</h5>
                          <CInput
                            value={d.illustrator}
														onChange={(e) => handleChange('illustrator', e, index)}
                          />
                        </CCol>
                        <CCol sm='6' className='mb-2'>  
                          <h5>Contributor Fee</h5>
                          <CInput
                            value={d.contributor_fee}
														onChange={(e) => handleChange('contributor_fee', e, index)}
                            type='number'
                          />
                        </CCol>
                        <CCol sm='6' className='mb-2'>  
                          <h5>Tags</h5>
                          <CInput
                            value={d.tags}
														onChange={(e) => handleChange('tags', e, index)}
                          />
                        </CCol>
                      </CRow>
                    </CCol>
                    <CCol sm='2'>
                      <div className='my-4'>
                        <CButton className='d-flex mb-3 w-100' size='md' color="secondary" onClick={() => {
                          setIsCrop(true)
                          croppingImage(d.filename)
                        }}>
                          <p className="d-flex align-items-center material-icons m-0">crop</p>&nbsp;Crop
                        </CButton>
                        <CButton 
                          onClick={() => {
                            d.remove()
                            handleRemove(d.filename)
                          }}
                          className='d-flex mb-3 w-100' 
                          size='md' 
                          color="danger">
                          <p className="d-flex align-items-center material-icons m-0">delete</p>&nbsp;Delete
                        </CButton>
                      </div>
                    </CCol>
                  </CRow>
                  
                  <div className={`${isCrop ? 'd-block' : 'd-none'}`}>    
                    <div className='d-flex justify-content-between'>
                      <div className='d-flex'>
                        <CButton 
                          onClick={() => setCrop({
                            aspect: 16 / 9
                          })}
                          className='d-flex mb-3 mr-2'
                          size='sm'
                          color={crop.aspect === 16 / 9 ? 'info' : 'secondary'}
                        >
                          16:9
                        </CButton>
                        <CButton 
                          onClick={() => setCrop({
                            aspect: 4 / 3
                          })}
                          className='d-flex mb-3 mr-2'
                          size='sm'
                          color={crop.aspect === 4 / 3 ? 'info' : 'secondary'}
                        >
                          4:3
                        </CButton>
                        <CButton 
                          onClick={() => setCrop({
                            aspect: 2 / 3
                          })}
                          className='d-flex mb-3 mr-2'
                          size='sm'
                          color={crop.aspect === 2 / 3 ? 'info' : 'secondary'}
                        >
                          2:3
                        </CButton>
                        <CButton 
                          onClick={() => setCrop({
                            aspect: 9 / 16
                          })}
                          className='d-flex mb-3 mr-2'
                          size='sm'
                          color={crop.aspect === 9 / 16 ? 'info' : 'secondary'}
                        >
                          9:16
                        </CButton>
                        <CButton 
                          onClick={() => setCrop({
                            aspect: 0
                          })}
                          className='d-flex mb-3 mr-2'
                          size='sm'
                          color={crop.aspect === 0 ? 'info' : 'secondary'}
                        >
                          Free
                        </CButton>
                      </div>
                      <div className='d-flex justify-content-end'>
                        <CButton 
                          className='d-flex mb-3 ml-2'
                          size='md'
                          color="secondary"
                          onClick={() => setIsCrop(false)}
                        >
                          Cancel
                        </CButton>
                        <CButton 
                          onClick={() => {
                            getCropImage(previewCanvasRef.current, completedCrop, d.filename)
                            setIsCrop(false)
                          }}
                          className='d-flex mb-3 ml-2'
                          size='md'
                          color="success"
                        >
                          Save
                        </CButton>
                      </div>
                    </div>
                    <div className='d-flex justify-content-center'>
                      <ReactCrop
                        src={d.previewUrl}
                        onImageLoaded={onLoad()}
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={(c) => setCompletedCrop(c)}
                      />
                    </div>
                    <div className='mt-4'>
                      <h3 className='mb-2 text-center'>Preview</h3>
                      <div className='d-flex justify-content-center'>
                        <canvas
                          ref={previewCanvasRef}
                          // Rounding is important so the canvas width and height matches/is a multiple for sharpness.
                          style={{
                            width: Math.round(completedCrop?.width ?? 0),
                            height: Math.round(completedCrop?.height ?? 0)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ))
            }
            <div className={`justify-content-center ${isCrop ? 'd-none' : 'd-flex'}`}>
              {
                isNotEmptyArray(uploadData) ? (
                  <CButton 
                    style={{margin: '0 auto'}}
                    onClick={() => toggleAddImageModal('addImageModal', uploadData)}
                    className='d-flex mb-3'
                    size='md'
                    color="success"
                  >
                    <p className="d-flex align-items-center material-icons m-0">cloud_upload</p>&nbsp;Upload
                  </CButton>
                ) : ''
              }
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
            {
              uploadData.map(i => (            
    						<p>Filename: {i.filename}</p>
              ))
            }
					</div>
				</Modal>
			}
    </>
  )
}

export default FileUploader
