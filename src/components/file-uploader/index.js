import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import ReactCrop from "react-image-crop";
import "cropperjs/dist/cropper.css";
import Dropzone from "react-dropzone-uploader";
import {
  CCol,
  CRow,
  CInput,
  CButton,
  CSpinner,
  CFormText,
} from "@coreui/react";
import "react-dropzone-uploader/dist/styles.css";
import "react-image-crop/dist/ReactCrop.css";
import { addImage, getAllImage } from "core/services/image_library";
import { isNotEmptyArray, isNotEmptyString } from "core/helpers";
import * as masterActions from "store/master/actions";
import * as regex from "core/regex";
import "./style.scss";

const Preview = ({ meta }) => {
  const { name, percent, status } = meta;
  return (
    <span
      style={{
        alignSelf: "flex-start",
        margin: "10px 3%",
        fontFamily: "Helvetica",
        display: "none",
      }}
    >
      {name}, {Math.round(percent)}%, {status}
    </span>
  );
};

const FileUploader = ({ setTab, setShowAddToContentBtn }) => {
  const dropzoneRef = useRef(null);
  const dispatch = useDispatch();
  const [isUploading, setIsUploading] = useState(false);
  // eslint-disable-next-line
  const [isHandling, setIsHandling] = useState(false);
  const [stateMeta, setStateMeta] = useState();
  const [uploadData, setUploadData] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);

  const [invalidType, setinvalidType] = useState(false);
  const [invalidSize, setinvalidSize] = useState(false);
  const [imageUploadErrorMessage, setImageUploadErrorMessage] = useState("");

  //CROPxx
  const [isCrop, setIsCrop] = useState(false);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState({
    id: 1,
    aspect: 0,
    x: 0,
    y: 0,
  });

  const [isUploaded, setIsUploaded] = useState(false);

  const [completedCrop, setCompletedCrop] = useState(null);

  /**
   * convert byte to kilobyte
   * @param {number}​ byteCount - must be a number
   * @return {number} filesize / 1000
   */
  const byteToKB = (byteCount) => {
    let bytePerKb = 1000;
    return byteCount / bytePerKb;
  };

  /**
   * on load of crop library
   * @param {object}​ img - reference of image element
   * @return {boolean} false
   */
  const onLoad = useCallback((img) => {
    imgRef.current = img;
    setCrop({
      id: 1,
      height: imgRef.current.height,
      width: imgRef.current.width,
      x: 0,
      y: 0,
    });

    return false;
  }, []);

  /**
   * convert base64 to file object
   * @param {string}​ dataUrl - base64 url
   * @param {string}​ filename - retain image filename
   * @return {object} new/cropped image/file reference
   */
  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(","),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  /**
   * get new/cropped iamge reference onclick
   * @param {node}​ canvas - html element
   * @param {object}​ crop - coordinates and dimension of cropped image in pixel
   * @param {string}​ itemId - key id of an object
   * @return {object} cropped image - final product
   */
  const getCropImage = (canvas, crop, itemId) => {
    if (!crop || !canvas || !completedCrop) {
      return;
    } else {
      setUploadData(
        uploadData.map((x) => {
          const base64Image = canvas.toDataURL(x.fileType);
          if (x.filename !== itemId) {
            return x;
          } else {
            const file = dataURLtoFile(base64Image, x.filename);
            return {
              ...x,
              image: file,
              size: byteToKB(file?.size),
              previewUrl: base64Image,
              isCrop: false,
            };
          }
        })
      );
    }
  };

  /**
   * display image and image info onclick
   * @param {string}​ itemId - key id of an object
   * @return {boolean} display object that has iScrop: true
   */
  const croppingImage = (itemId) => {
    setUploadData(
      uploadData.map((x) => {
        if (x.filename === itemId) {
          return { ...x, isCrop: true };
        } else {
          return { ...x, isCrop: false };
        }
      })
    );
  };

  /**
   * hide image and image info onclick
   * @param {string}​ itemId - key id of an object
   * @return {boolean} set specific object to isCrop: false
   */
  const notCroppingImage = (itemId) => {
    setUploadData(
      uploadData.map((x) => {
        if (x.filename !== itemId) {
          setIsCrop(false);
          return { ...x, isCrop: false };
        } else {
          return { ...x, isCrop: true };
        }
      })
    );
  };

  /**
   * check inputted string if has http or https
   * @param {string}​ itemId - key id of an object
   * @return {string} http://sample
   */
  const handleLinkBlur = (itemId) => {
    setUploadData(
      uploadData.map((x) => {
        if (x.filename === itemId) {
          if (!regex.httpAndHttps.test(x.link)) {
            return { ...x, link: `http://${x?.link}` };
          }
        }
        return x;
      })
    );
  };

  /**
   * provide new image image after resizing
   * @param {object}​ completedCrop - coordinates and dimension of cropped image in pixel
   * @param {object}​ previewCanvasRef - canvas reference/DOM
   * @param {object}​ imgRef - image reference/DOM
   * @return {object} cropped image after resizing
   */
  const cropEffect = (completedCrop, previewCanvasRef, imgRef) => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio;

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

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
  };

  useEffect(() => {
    cropEffect(completedCrop, previewCanvasRef, imgRef);
  }, [completedCrop, previewCanvasRef, imgRef]);

  useEffect(() => {
    if (invalidType || invalidSize) {
      setImageUploadErrorMessage(
        "The uploaded images does not meet the criteria. Make sure to upload images that is equal or below 500KB and file format should be jpeg, jfif, png, gif, or webp"
      );
    } else {
      setImageUploadErrorMessage(imageUploadErrorMessage);
    }
    // eslint-disable-next-line
  }, [invalidType, invalidSize]);

  /**
   * input fields onchange handler
   * @param {string}​ prop - field name
   * @param {object}​ event - input event
   * @param {number}​ index - key
   * @return {array} new set of array
   */
  const handleChange = (prop, event, index) => {
    const old = uploadData[index];
    const updated = { ...old, [prop]: event.target.value };
    const clone = [...uploadData];
    clone[index] = updated;
    setUploadData(clone);
  };

  

  /**
   * add image/multiple images
   */
  const handleAddImage = async () => {
    setIsUploading(true);
    try {
      await Promise.all(
        uploadData.map(async (i) => {
          const payloadData = new FormData();
          payloadData.append("alt_text", i.alt_text);
          payloadData.append("photographer", i.photographer);
          payloadData.append("illustrator", i.illustrator);
          payloadData.append("link_label", i.link_label);
          payloadData.append("link", i.link);
          payloadData.append("contributor_fee", i.contributor_fee);
          payloadData.append("tags", i.tags);
          payloadData.append("image", i.image);
          let response = await addImage(payloadData);
          setUploadData([]);
          uploadData.forEach((f) => f.remove());
          if (response.data.successful) {
            loadData();

            setUploadedImages((uploadedImage) => [
              ...uploadedImage,
              {
                path: response?.data?.data?.path,
                name: response?.data?.data?.filename,
              },
            ]);
            setIsUploaded(true);
            setImageUploadErrorMessage("");
          } else {
            dispatch(
              masterActions.updateNotificationModal({
                open: true,
                type: "error",
                bodyText: response?.data?.message,
              })
            );
          }
          return response.data.data;
        })
      );
    } catch (error) {
      console.log(error && "Invalid image");
      dispatch(
        masterActions.updateNotificationModal({
          open: true,
          type: "error",
          bodyText: "Invalid image",
        })
      );
    }
    loadData();
    setIsUploading(false);
  };

  /**
   * remove specific object in array
   * @param {number}​ id - index 
   * @return {array} new set of array
   */
  const handleRemove = (id) => {
    const tempArray = [...uploadData];
    tempArray.splice(id, 1);
    setUploadData(tempArray);
  };

  /**
   * dropped image/s in image uploader
   * @param {object}​ meta - image/file info 
   * @return {array} new set of array
   */
  const handleChangeStatus = (meta) => {
    setStateMeta(meta);
    const extension = meta?.meta?.name
      ?.substring(meta?.meta?.name?.lastIndexOf(".") + 1)
      ?.toLowerCase();
    // console.log(meta);
    const size = byteToKB(meta?.file?.size);
    const isDone = meta.meta.status === "done";
    const isExist = uploadData?.filter(
      (item) => item.filename === meta.meta.name
    );
    if (
      extension === "webp" ||
      extension === "gif" ||
      extension === "jfif" ||
      extension === "jfi" ||
      extension === "png" ||
      extension === "bmp" ||
      extension === "jpeg" ||
      extension === "jpg"
    ) {
      setinvalidType(false);
      if (stateMeta?.meta?.size >= 500000) {
        setinvalidSize(true);
      } else {
        setinvalidSize(false);
      }
    } else {
      setinvalidType(true);
    }

    if (isDone && isExist?.length === 0) {
      setUploadData((uploadData) => [
        ...uploadData,
        {
          filename: meta.meta.name,
          image: meta.file,
          previewUrl: meta.meta.previewUrl,
          size: size.toFixed(1),
          percent: Math.round(meta.meta.percent),
          alt_text: "",
          photographer: "",
          illustrator: "",
          link_label: "",
          link: "",
          contributor_fee: 0,
          tags: "",
          remove: meta.remove,
          isCrop: false,
          previewCanvasRef: previewCanvasRef,
          fileType: meta.file.type,
        },
      ]);
    }
  };

  /**
   * input fields onchange handler
   * @param {string}​ el - value of each object
   * @return {boolean} set specific object to isCrop: false
   */
  const filterCropping = uploadData.filter((el) => {
    return el.isCrop === true;
  });

  // load list of images, 30 initially
  const loadData = async () => {
    setIsHandling(true);
    await getAllImage(30);
    setIsHandling(false);
  };

  return (
    <>
      <CFormText className="mb-1 py-3">
        &#9432; Maximum file size of image is 500KB. Valid file types: jpeg,
        jfif, png, gif, or webp.
      </CFormText>
      <div className={isCrop || isUploaded ? "d-none" : "d-block"}>
        <Dropzone
          handleReset={(event) => console.log("event:", event)}
          ref={dropzoneRef}
          onChangeStatus={handleChangeStatus}
          accept="image/jpeg, image/webp, image/gif, image/png, image/bmp, image/jpeg, image/jpg, image/jfif"
          inputContent="Drop/Select image"
          inputWithFilesContent="Drop/Select image"
          disabled={(files) =>
            files.some((f) =>
              ["preparing", "getting_upload_params", "uploading"].includes(
                f.meta.status
              )
            )
          }
          maxSizeBytes={500000}
          PreviewComponent={Preview}
        />
      </div>

      {/* PREVIEW OF UPLOADED IMAGES */}
      <div class={`${isUploaded ? "d-block" : "d-none"}`}>
        <div className="d-flex justify-content-center mt-3">
          <CButton
            onClick={(event) => {
              setIsUploaded(false);
              setUploadedImages([]);
              setTab("image_library");
              setShowAddToContentBtn(event);
            }}
            className="d-flex mb-3 mx-1"
            size="md"
            color="info"
          >
            <p className="d-flex align-items-center material-icons m-0">
              visibility
            </p>{" "}
            &nbsp; View Image Library
          </CButton>
        </div>
        <div className="d-block">
          <table
            className="table table-striped d-block w-100"
            style={{ overflow: "auto" }}
          >
            <tbody>
              {uploadedImages.map((uploadedImage, index) => (
                <tr key={index}>
                  <td width="10%" className="align-middle p-1">
                    <p className="mb-0">
                      <img
                        className="w-100"
                        src={uploadedImage.path}
                        alt={uploadedImage.name}
                        style={{
                          objectFit: "contain",
                        }}
                      />
                    </p>
                  </td>
                  <td width="500px" className="align-middle p-1">
                    <p
                      style={{ wordBreak: "break-all", maxWidth: "200px" }}
                      className="text-truncate"
                    >
                      {uploadedImage.name}
                    </p>
                  </td>
                  <td
                    width="300px"
                    className="align-middle p-1"
                    style={{
                      verticalAlign: "center",
                    }}
                  >
                    <p className="mb-0 text-success font-weight-bold text-right pr-3">
                      Uploaded
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {stateMeta ? (
        <div className="d-block mt-3">
          <div className={`${isCrop ? "d-none" : "d-block"}`}>
            <div className={`${isUploaded ? "d-none" : "d-block"}`}>
              {isNotEmptyString(imageUploadErrorMessage) && (
                <p className="text-danger small mb-0 pb-3">
                  {imageUploadErrorMessage}
                </p>
              )}
            </div>
          </div>
          <div
            className={`justify-content-center w-100 mb-5 ${
              isCrop ? "d-none" : "d-flex"
            }`}
          >
            {isNotEmptyArray(uploadData) ? (
              <>
                <CButton
                  onClick={() => handleAddImage()}
                  className="d-flex mb-3 mx-1"
                  size="md"
                  color="info"
                  disabled={isUploading}
                >
                  <p className="d-flex align-items-center material-icons m-0">
                    cloud_upload
                  </p>
                  &nbsp;Upload All &nbsp;
                  {isUploading && <CSpinner size="sm" color="secondary" />}
                </CButton>
                <CButton
                  onClick={() => {
                    setUploadData([]);
                    stateMeta.remove();
                    setImageUploadErrorMessage("");
                    uploadData.forEach((f) => f.remove());
                  }}
                  className="d-flex mb-3 mx-1"
                  size="md"
                  color="danger"
                  disabled={isUploading}
                >
                  <p className="d-flex align-items-center material-icons m-0">
                    not_interested
                  </p>
                  &nbsp;Remove All
                </CButton>
              </>
            ) : (
              ""
            )}
          </div>
          {uploadData.map((d, index) => (
            <div key={index}>
              <CRow
                className={`mx-0 ${isCrop ? "d-none" : "d-flex"}`}
                key={index}
              >
                <CCol lg="2" className="mb-2">
                  <img
                    className="w-100 mb-1"
                    src={d.previewUrl}
                    alt="images"
                    style={{
                      objectFit: "contain",
                      height: "90px",
                    }}
                  />
                  <div className="mb-2">
                    <p className="text-center mb-0 text-break text-truncate">
                      {d.filename}
                    </p>
                  </div>
                  {/* <CProgress animated striped color="info" value={d.percent} className="mb-1 w-100 bg-white" /> */}
                  <p className="text-center">{d.size} kb</p>
                </CCol>
                <CCol lg="8" className="mb-2">
                  <CRow className="mx-0">
                    <CCol lg="6" className="mb-2">
                      <h5>Alt Text</h5>
                      <CInput
                        value={d.alt_text}
                        onChange={(e) => handleChange("alt_text", e, index)}
                        placeholder="Add an Alternate Text"
                      />
                      <CFormText className="help-block">
                        <p>
                          &#9432; &nbsp; display below the field: Describe the
                          image as if you’d search for it. e.g. "woman reading
                          book". Alt Text aids in accessibility, improves
                          "topical relevance" on search engines, helps you rank
                          on Google Images, and serves as a placeholder for
                          images.
                        </p>
                      </CFormText>
                    </CCol>
                    <CCol lg="6" className="mb-2"></CCol>
                    <CCol lg="6" className="mb-2">
                      <h5>Photographer</h5>
                      <CInput
                        value={d.photographer}
                        onChange={(e) => handleChange("photographer", e, index)}
                        placeholder="Credit the photo."
                      />
                    </CCol>
                    <CCol lg="6" className="mb-2">
                      <h5>Illustrator</h5>
                      <CInput
                        value={d.illustrator}
                        onChange={(e) => handleChange("illustrator", e, index)}
                        placeholder="Enter illustrator's name"
                      />
                    </CCol>
                    <CCol lg="6" className="mb-2">
                      <h5>Link Label</h5>
                      <CInput
                        value={d.link_label}
                        onChange={(e) => handleChange("link_label", e, index)}
                        placeholder="Link's Label"
                      />
                    </CCol>
                    <CCol lg="6" className="mb-2">
                      <h5>Link</h5>
                      <CInput
                        value={d.link}
                        onChange={(e) => handleChange("link", e, index)}
                        placeholder="Enter URL"
                        onBlur={() => handleLinkBlur(d.filename)}
                      />
                    </CCol>
                    <CCol lg="6" className="mb-2">
                      <h5>Contributor Fee</h5>
                      <CInput
                        type="number"
                        min={0}
                        value={d.contributor_fee}
                        onChange={(e) => {
                          handleChange("contributor_fee", e, index);
                        }}
                        placeholder="Outsourced photo? Place the cost here."
                        onKeyDown={(e) => {
                          if (["-", "+", "e", "E"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                      />
                    </CCol>
                    <CCol lg="6" className="mb-2">
                      <h5>Tags</h5>
                      <CInput
                        value={d.tags}
                        onChange={(e) => handleChange("tags", e, index)}
                        placeholder="Add tags to this photo."
                      />
                    </CCol>
                  </CRow>
                </CCol>
                <CCol lg="2">
                  <div className="my-4">
                    <CButton
                      className="justify-content-center d-flex mb-3 w-100"
                      size="md"
                      color="secondary"
                      onClick={() => {
                        setIsCrop(true);
                        croppingImage(d.filename);
                      }}
                      disabled={isUploading}
                    >
                      <p className="d-flex align-items-center material-icons m-0">
                        crop
                      </p>
                      &nbsp;Crop
                    </CButton>
                    <CButton
                      onClick={() => {
                        d.remove();
                        handleRemove(index);
                      }}
                      className="justify-content-center d-flex mb-3 w-100"
                      size="md"
                      color="danger"
                      disabled={isUploading}
                    >
                      <p className="d-flex align-items-center material-icons m-0">
                        delete
                      </p>
                      &nbsp;Remove
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            </div>
          ))}
          <div className={`${isCrop ? "d-block" : "d-none"}`}>
            {filterCropping.map((d, index) => (
              <div key={index}>
                <div className="crop-buttons d-flex justify-content-between">
                  <div className="d-flex crop-left">
                    <CButton
                      onClick={() =>
                        setCrop({
                          id: 6,
                          aspect: 16 / 9,
                          height:
                            imgRef.current.height > imgRef.current.width
                              ? imgRef.current.height
                              : imgRef.current.width,
                          x: 0,
                          y: 0,
                        })
                      }
                      className="d-flex mb-3 mr-2"
                      size="sm"
                      color={
                        crop.id === 6 || crop.aspect === 16 / 9
                          ? "info"
                          : "secondary"
                      }
                    >
                      16:9
                    </CButton>
                    <CButton
                      onClick={() =>
                        setCrop({
                          id: 5,
                          aspect: 4 / 3,
                          height:
                            imgRef.current.height > imgRef.current.width
                              ? imgRef.current.height
                              : imgRef.current.width,
                          x: 0,
                          y: 0,
                        })
                      }
                      className="d-flex mb-3 mr-2"
                      size="sm"
                      color={
                        crop.id === 5 || crop.aspect === 4 / 3
                          ? "info"
                          : "secondary"
                      }
                    >
                      4:3
                    </CButton>
                    <CButton
                      onClick={() =>
                        setCrop({
                          id: 4,
                          aspect: 1 / 1,
                          height:
                            imgRef.current.height > imgRef.current.width
                              ? imgRef.current.height
                              : imgRef.current.width,
                          x: 0,
                          y: 0,
                        })
                      }
                      className="d-flex mb-3 mr-2"
                      size="sm"
                      color={
                        crop.id === 4 || crop.aspect === 1 / 1
                          ? "info"
                          : "secondary"
                      }
                    >
                      1:1
                    </CButton>
                    <CButton
                      onClick={() =>
                        setCrop({
                          id: 3,
                          aspect: 2 / 3,
                          height:
                            imgRef.current.height > imgRef.current.width
                              ? imgRef.current.height
                              : imgRef.current.width,
                          x: 0,
                          y: 0,
                        })
                      }
                      className="d-flex mb-3 mr-2"
                      size="sm"
                      color={
                        crop.id === 3 || crop.aspect === 2 / 3
                          ? "info"
                          : "secondary"
                      }
                    >
                      2:3
                    </CButton>
                    <CButton
                      onClick={() =>
                        setCrop({
                          id: 2,
                          aspect: 9 / 16,
                          height:
                            imgRef.current.height > imgRef.current.width
                              ? imgRef.current.height
                              : imgRef.current.width,
                          x: 0,
                          y: 0,
                        })
                      }
                      className="d-flex mb-3 mr-2"
                      size="sm"
                      color={
                        crop.id === 2 || crop.aspect === 9 / 16
                          ? "info"
                          : "secondary"
                      }
                    >
                      9:16
                    </CButton>
                    <CButton
                      onClick={() => {
                        setCrop({
                          id: 1,
                          aspect: 0,
                          height: imgRef.current.height,
                          width: imgRef.current.width,
                          x: 0,
                          y: 0,
                        });
                        setCompletedCrop({
                          id: 1,
                          aspect: 0,
                          height: imgRef.current.height,
                          width: imgRef.current.width,
                          x: 0,
                          y: 0,
                        });
                      }}
                      className="d-flex mb-3 mr-2"
                      size="sm"
                      color={
                        crop.id === 1 || crop.aspect === 0
                          ? "info"
                          : "secondary"
                      }
                    >
                      Free
                    </CButton>
                  </div>
                  <div className="d-flex crop-right justify-content-end">
                    <CButton
                      className="d-flex mb-3 ml-2"
                      size="md"
                      color="secondary"
                      onClick={() => {
                        notCroppingImage(d.isCrop);
                      }}
                    >
                      Cancel
                    </CButton>
                    <CButton
                      onClick={() => {
                        getCropImage(
                          previewCanvasRef.current,
                          completedCrop,
                          d.filename
                        );
                        setCompletedCrop(null);
                        setIsCrop(false);
                      }}
                      className="d-flex mb-3 ml-2"
                      size="md"
                      color="success"
                    >
                      Save
                    </CButton>
                  </div>
                </div>
                <div className="d-flex justify-content-center">
                  <ReactCrop
                    src={d.previewUrl}
                    onImageLoaded={onLoad}
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                  />
                </div>
                <div className="mt-4 d-none">
                  <h3 className="mb-2 text-center">Preview</h3>
                  <div className="d-flex justify-content-center">
                    <canvas
                      ref={d.previewCanvasRef}
                      // Rounding is important so the canvas width and height matches/is a multiple for sharpness.
                      style={{
                        width: Math.round(completedCrop?.width ?? 0),
                        height: Math.round(completedCrop?.height ?? 0),
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default FileUploader;
