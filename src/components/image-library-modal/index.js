import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CRow,
  CCol,
  CInput,
  CButton,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CCardBody,
  CTabs,
  CNav,
  CInputGroup,
  CInputGroupAppend,
  CForm,
  CSpinner,
  CFormText,
  CTextarea,
} from "@coreui/react";
import FileUploader from "../file-uploader";
import CardImg from "components/card-image";
import Modal from "components/Modal";
import {
  getImageById,
  deleteImage,
  getAllImage,
  editImage,
} from "core/services/image_library";
import "./style.scss";
import { isNotEmptyArray, isNotEmptyObject } from "core/helpers";
import * as regex from "core/regex";

const ImageLibraryModal = ({
  /* new prop */
  searchValue,
  onChangeSearch,
  hasFooter,
  footer,
  addToContent,
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
  addContentClass,
}) => {
  const imageContainer = useRef(null);
  const userPermissions = useSelector((state) => state.master.userPermissions);
  const [imagePageLimit, setImagePageLimit] = useState(30);
  // eslint-disable-next-line
  const [isHandling, setIsHandling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [tabs, setTabs] = useState("image_library");

  const [deleteImageModal, setDeleteImageModal] = useState({
    open: false,
    data: {},
  });

  const [editImageModal, setEditImageModal] = useState({
    open: false,
    data: {},
  });

  const [image, setImage] = useState({});
  const [showExtended, setShowExtended] = useState(false);
  const [showAddToContentBtn, setShowAddToContentBtn] = useState(true);
  const isAllowedToEditImage = userPermissions.includes("ImageLibrary.Edit");
  const isAllowedToCreateImage = userPermissions.includes(
    "ImageLibrary.Create"
  );

  /**
   * Edit modal toggler
   * @param {string}​ type - modal name
   * @param {object}​ data - image detail
   * @return {object} confirm image detail to edit
   */
  const toggleEditModal = (type, data) => {
    if (type === "editImageModal") {
      setEditImageModal({
        ...editImageModal,
        open: !editImageModal.open,
        data: data,
      });
    }
  };

  /**
   * Delete modal toggler
   * @param {string}​ type - modal name
   * @param {object}​ data - image detail
   * @return {object} confirm image detail to delete
   */
  const toggleDeleteModal = (type, data) => {
    if (type === "deleteImageModal") {
      setDeleteImageModal({
        ...deleteImageModal,
        open: !deleteImageModal.open,
        data: data,
      });
    }
  };

  /**
   * fields onchange handler
   * @param {string}​ type - input field name
   * @param {string | number}​ value - input field value
   * @return {object} updated object
   */
  const handleChange = (type, value) => {
    setImage({
      ...image,
      [type]: value,
    });
  };

  /**
   * get the value of selected image
   * @param {string}​ select - input field name
   * @param {object}​ select - value of selected image
   * @return {object} selected image detail
   */
  const handleSelectImage = (select) => {
    if (isAllowedToEditImage) {
      setShowExtended(true);
    }
    setImage(select);
  };

  /**
   * delete image by id
   */
  const handleDelete = async (image_id) => {
    setIsDeleting(true);
    try {
      const res = await deleteImage(image_id);
      if (res.successful) {
        setShowExtended(false);
        toggleDeleteModal("deleteImageModal", null);
        loadData();
      }
    } catch (error) {
      console.log(error);
    }
    setIsDeleting(false);
    setDeleteImageModal({
      ...deleteImageModal,
      open: false,
    });
  };

  /**
   * edit image
   */
  const handleEditImage = async () => {
    setIsSaving(true);
    try {
      const response = await editImage({
        image_id: image.image_id,
        alt_text: image.alt_text,
        photographer: image.photographer,
        link_label: image.link_label,
        link: image.link,
        illustrator: image.illustrator,
        contributor_fee:
          image.contributor_fee !== "" ? image.contributor_fee : 0,
        tags: image.tags,
      });
      if (response.data.successful) {
        loadData();
      }
    } catch (error) {
      console.log(error);
    }
    setIsSaving(false);
    setEditImageModal({
      ...editImageModal,
      open: false,
    });
  };

  /**
   * image library extension toggler
   * @return {boolean} show/hide image library extension
   */
  const toggleShowExtended = () => {
    if (image && image) {
      setShowExtended(!showExtended);
    }
  };

  /**
   * search image
   */
  const onSearch = async () => {
    setIsHandling(true);
    await getAllImage(imagePageLimit, searchValue);
    setIsHandling(false);
  };

  /**
   * get image data by id
   */
  const loadImageData = async () => {
    setIsHandling(true);
    await getImageById(image && image.image_id);
    setIsHandling(false);
  };

  /**
   * get all images
   */
  const loadData = async () => {
    setIsHandling(true);
    await getAllImage(imagePageLimit);
    setIsHandling(false);
  };

  /**
   * close image library modal
   * remove selected image
   * @return {boolean} hide image library modal
   */
  const handleCloseModal = () => {
    onClose();
    setImage({});
  };

  /**
   * show 30 more images in every on scroll
   * imagePageLimit + 30
   * and so on...
   * @return {number} selected image detail
   */
  const onScrollShowMoreImages = () => {
    if (
      imageContainer?.current?.scrollTop +
        imageContainer?.current?.clientHeight >=
      imageContainer?.current?.scrollHeight
    ) {
      loadData();
      setImagePageLimit((limit) => limit + 30);
    }
  };

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "inherit";
    loadData();
    image?.image_id && loadImageData();
    // eslint-disable-next-line
  }, [show, imagePageLimit]);

  return (
    <>
      <CModal
        className={`_modal-right extended`}
        innerRef={innerRef}
        show={show}
        centered={centered}
        size="lg"
        backdrop={backdrop}
        color={color}
        borderColor={borderColor}
        onOpened={onOpened}
        onClosed={onClosed}
        fade={fade}
        closeOnBackdrop={false}
        onClose={onClose}
        addContentClass={addContentClass}
      >
        <CRow
          className="parent-container d-flex"
          style={{ overflowY: "scroll" }}
        >
          {/* EXTENDED */}
          <CCol
            className={`left p-0 ${showExtended ? "d-block-sp" : "d-none-sp"}`}
            sm="3"
          >
            <div className={`${showExtended ? "d-block" : "d-none"} p-3`}>
              <div className="d-flex justify-content-between">
                <h4 className="mb-4">Image Details</h4>
                <p
                  className="material-icons button-extension-sp mb-0 d-lg-none d-sm-block"
                  onClick={() => toggleShowExtended()}
                >
                  keyboard_arrow_down
                </p>
              </div>
              <CRow>
                <CCol sm="12" className="mb-3">
                  <h5>Alt Text</h5>
                  <CTextarea
                    value={image?.alt_text}
                    onChange={(e) => handleChange("alt_text", e.target.value)}
                    placeholder="Add an Alternate Text"
                  />
                  <CFormText className="help-block">
                    <p>
                      &#9432; &nbsp; display below the field: Describe the image
                      as if you’d search for it. e.g. "woman reading book". Alt
                      Text aids in accessibility, improves "topical relevance"
                      on search engines, helps you rank on Google Images, and
                      serves as a placeholder for images.
                    </p>
                  </CFormText>
                </CCol>
                <CCol sm="12" className="mb-3">
                  <h5>Photographer</h5>
                  <CInput
                    value={image?.photographer}
                    onChange={(e) =>
                      handleChange("photographer", e.target.value)
                    }
                    placeholder="Credit the photo."
                  />
                </CCol>
                <CCol sm="12" className="mb-3">
                  <h5>Illustrator</h5>
                  <CInput
                    value={image?.illustrator}
                    onChange={(e) =>
                      handleChange("illustrator", e.target.value)
                    }
                    placeholder="Enter Illustrator's name"
                  />
                </CCol>
                <CCol sm="12" className="mb-3">
                  <h5>Contributor Fee</h5>
                  <CInput
                    value={image?.contributor_fee}
                    onChange={(e) => {
                      handleChange("contributor_fee", e.target.value);
                    }}
                    placeholder="Outsourced photo? Place the cost here."
                    type="number"
                    onKeyDown={(e) => {
                      if (["-", "+", "e", "E"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    min={0}
                  />
                </CCol>
                <CCol sm="12" className="mb-3">
                  <h5>Link Label</h5>
                  <CInput
                    value={image?.link_label}
                    onChange={(e) => handleChange("link_label", e.target.value)}
                    placeholder="Link's Label"
                  />
                </CCol>
                <CCol sm="12" className="mb-3">
                  <h5>Link</h5>
                  <CInput
                    value={image?.link}
                    onChange={(e) => handleChange("link", e.target.value)}
                    placeholder="Enter URL"
                    onBlur={() => {
                      if (image?.link === "") {
                        setImage({
                          ...image,
                          link: "",
                        });
                      } else if (!regex.httpAndHttps.test(image?.link)) {
                        setImage({
                          ...image,
                          link: `http://${image?.link}`,
                        });
                      }
                    }}
                  />
                </CCol>
                <CCol sm="12" className="mb-3">
                  <h5>Tags</h5>
                  <CTextarea
                    value={image?.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                    placeholder="Add tags to this photo."
                  />
                </CCol>
              </CRow>
              <CButton
                style={{ backgroundColor: "#3F4C61", borderColor: "#3F4C61" }}
                onClick={() => toggleEditModal("editImageModal", image)}
                className="d-block mb-0 w-100"
                color="success"
                disable
                disabled={isSaving || !isNotEmptyObject(image)}
              >
                Save {isSaving && <CSpinner size="sm" color="secondary" />}
              </CButton>
            </div>
          </CCol>
          {/* /EXTENDED */}
          <CCol
            className={`right px-0 ${
              showExtended ? "d-none-sp" : "d-block-sp"
            }`}
            sm="9"
          >
            <CModalHeader className="d-flex justify-content-between">
              <CButton
                onClick={() => handleCloseModal()}
                className="d-block mb-0 py-0"
                style={{ fontSize: "1.3125rem" }}
              >
                ×
              </CButton>
              {showAddToContentBtn && (
                <CButton
                  disabled={image && isNotEmptyObject(image) ? false : true}
                  onClick={() => {
                    addToContent(image);
                    handleCloseModal();
                  }}
                  className="d-block mb-0"
                  color="success"
                >
                  Add To Content
                </CButton>
              )}
            </CModalHeader>
            {isAllowedToEditImage && (
              <button
                className="button-extension p-0"
                onClick={() => toggleShowExtended()}
                disabled={tabs === "upload"}
              >
                <i
                  style={{
                    transform: showExtended
                      ? "rotate(180deg)"
                      : "rotate(360deg)",
                  }}
                  className="material-icons"
                >
                  keyboard_arrow_right
                </i>
              </button>
            )}
            <CModalBody className="pt-0">
              <CCardBody>
                <CTabs
                  activeTab={tabs}
                  onActiveTabChange={(tab) => setTabs(tab)}
                >
                  <CNav variant="tabs">
                    <CNavItem>
                      <CNavLink
                        data-tab="image_library"
                        onClick={() => {
                          setShowAddToContentBtn(true);
                          // setTabs("image_library");
                        }}
                      >
                        Image Library
                      </CNavLink>
                    </CNavItem>
                    <CNavItem
                      onClick={() => {
                        setShowExtended(false);
                        setShowAddToContentBtn(false);
                        // setTabs("upload");
                      }}
                    >
                      {isAllowedToCreateImage && (
                        <CNavLink data-tab="upload">Upload Image</CNavLink>
                      )}
                    </CNavItem>
                  </CNav>
                  <CTabContent
                    className="p-2"
                    style={{
                      border: "1px solid",
                      borderColor: "#c4c9d0",
                      borderTop: "0",
                      borderBottomLeftRadius: "5px",
                      borderBottomRightRadius: "5px",
                      overflow: "hidden",
                    }}
                  >
                    <CTabPane data-tab="image_library">
                      <CForm
                        onSubmit={(e) => {
                          e.preventDefault();
                          onSearch();
                        }}
                      >
                        <CInputGroup className="mb-3">
                          <CInput
                            placeholder="Search Item by Tags or Filename"
                            value={searchValue}
                            onChange={onChangeSearch}
                          />
                          <CInputGroupAppend>
                            <CButton
                              type="submit"
                              color="info"
                              className="py-0"
                            >
                              <i className="material-icons">search</i>
                            </CButton>
                          </CInputGroupAppend>
                        </CInputGroup>
                      </CForm>
                      <div
                        className="_image-widget mx-0"
                        ref={imageContainer}
                        onScroll={() => onScrollShowMoreImages()}
                      >
                        <CRow className="mx-0">
                          {data && isNotEmptyArray(data) ? (
                            data.map((img) => (
                              <CardImg
                                className={
                                  img.image_id === (image && image.image_id)
                                    ? "selected"
                                    : ""
                                }
                                key={img && img.image_id}
                                src={img && img.path}
                                selectImage={() => handleSelectImage(img)}
                                deleteImage={() =>
                                  toggleDeleteModal("deleteImageModal", img)
                                }
                              />
                            ))
                          ) : (
                            <p className="text-center">
                              No image found. Change your search parameters and
                              try submitting again.
                            </p>
                          )}
                        </CRow>
                      </div>
                    </CTabPane>
                    <CTabPane data-tab="upload">
                      <FileUploader
                        setTab={setTabs}
                        setShowAddToContentBtn={() =>
                          setShowAddToContentBtn(true)
                        }
                      />
                    </CTabPane>
                  </CTabContent>
                </CTabs>
              </CCardBody>
            </CModalBody>
            <CModalFooter className={`${hasFooter ? "d-flex" : "d-none"}`}>
              {footer}
            </CModalFooter>
          </CCol>
        </CRow>

        {editImageModal.open && (
          <Modal
            className="_modal-override"
            show={editImageModal.open}
            toggle={() => toggleEditModal("editImageModal")}
            headerText="Do you want to save changes?"
            closeText="Cancel"
            callbackText="Continue and save changes"
            onCallback={() => handleEditImage()}
            buttonType="info"
            loading={isSaving}
          >
            <p className="mb-0 text-break text-center text-md">sample</p>
          </Modal>
        )}

        {deleteImageModal.open && (
          <Modal
            className="_modal-override"
            show={deleteImageModal.open}
            toggle={() => toggleDeleteModal("deleteImageModal")}
            headerText="Are you sure you want to remove this image?"
            closeText="Cancel"
            callbackText="Continue"
            onCallback={() => {
              handleDelete(deleteImageModal.data.image_id);
            }}
            buttonType="danger"
            loading={isDeleting}
          >
            <p className="mb-0 text-break text-center text-md">
              {deleteImageModal.data.filename}
            </p>
          </Modal>
        )}
      </CModal>
    </>
  );
};

export default ImageLibraryModal;
