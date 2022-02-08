import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  CLabel,
  CRow,
  CCol,
  CInput,
  CSelect,
  CButton,
  CCard,
  CCardHeader,
  CCardBody,
  CAlert,
  CLink,
  CSpinner,
  CSwitch,
} from "@coreui/react";
import { useSelector } from "react-redux";
import Modal from "components/Modal";
import { addTag, editTag, checkSlug } from "core/services/tags";
import { getTagById, getAllTag } from "core/services/tags";
import * as masterActions from "store/master/actions";
import * as actionTools from "store/tools/actions";
import { isNotEmptyString, formatSlug } from "core/helpers";

const TagForm = ({ match }) => {
  const dispatch = useDispatch();
  const isEdit = match.params.id;
  const breadCrumbs = useSelector((state) => state.tools.breadCrumbs);
  const userPermissions = useSelector((state) => state.master.userPermissions);
  const isAllowedToEdit = userPermissions.includes("Tag.Edit");
  const isAllowedToCreate = userPermissions.includes("Tag.Create");
  const isAllowedToDisable = userPermissions.includes("Tag.Disable");
  const [isHandling, setIsHandling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isNotValidTagId, setIsNotValidTagId] = useState(false);
  const [isSlugExist, setIsSlugExist] = useState(false);
  const [data, setData] = useState({
    tag_id: 0,
    name: "",
    slug: "",
    type: 1,
    status: 1,
  });
  const [isValid, setIsValid] = useState({
    name: true,
  });
  const [valid, setValid] = useState(true);
  const [addModal, setAddModal] = useState({
    open: false,
    data: {},
  });
  const [editModal, setEditModal] = useState({
    open: false,
    data: {},
  });

  /**
   * fields onchange handler
   * @param {string}​ type - input field name
   * @param {string | number}​ value - input field value
   * @return {object} updated object
   */
  const handleChange = (type, value) => {
    setData({
      ...data,
      [type]: value,
    });
  };

  /**
   * add modal toggler
   * @param {string}​ type - modal name
   * @param {object}​ data - details
   * @return {object} confirm to add
   */
  const toggleAddModal = (type, data) => {
    if (type === "addModal") {
      setAddModal({
        ...addModal,
        open: !addModal.open,
        data: data,
      });
    }
  };

  /**
   * add modal toggler
   * @param {string}​ type - modal name
   * @param {object}​ data - details
   * @return {object} confirm to edit
   */
  const toggleEditModal = (type, data) => {
    if (type === "editModal") {
      setEditModal({
        ...editModal,
        open: !editModal.open,
        data: data,
      });
    }
  };

  // add tag
  const handleAdd = async () => {
    if (data && isNotEmptyString(data.name)) {
      setValid(true);
      setIsSaving(true);
      try {
        const response = await addTag(data);
        if (response?.data?.successful) {
          toggleAddModal("addModal", null);
          dispatch(
            masterActions.updateNotificationModal({
              open: true,
              type: "success",
              bodyText: response.data?.message,
              callback: async (closeModal) => {
                closeModal();
                window.location.href = `/tools/tagForm/${response.data.data.id}`;
              },
            })
          );
        } else {
          dispatch(
            masterActions.updateNotificationModal({
              open: true,
              type: "error",
              bodyText: response?.data.message,
            })
          );
        }
      } catch (error) {
        dispatch(
          masterActions.updateNotificationModal({
            open: true,
            type: "error",
            bodyText: error,
          })
        );
      }
      setIsSaving(false);
    } else {
      setValid(false);
    }
  };

  // edit tag
  const handleEdit = async () => {
    if (data && isNotEmptyString(data.name)) {
      setValid(true);
      setIsSaving(true);
      try {
        const response = await editTag({
          ...data,
          status: data?.status?.toString(),
        });
        if (response?.successful) {
          toggleEditModal("editModal", null);
          dispatch(
            masterActions.updateNotificationModal({
              open: true,
              type: "success",
              bodyText: response.message,
              callback: async (closeModal) => {
                closeModal();
                loadData();
              },
            })
          );
        } else {
          toggleEditModal("editModal", null);
          dispatch(
            masterActions.updateNotificationModal({
              open: true,
              type: "error",
              bodyText: response?.message,
            })
          );
        }
      } catch (error) {
        dispatch(
          masterActions.updateNotificationModal({
            open: true,
            type: "error",
            bodyText: error,
          })
        );
      }
      setIsSaving(false);
    } else {
      setValid(false);
    }
  };

  /**
   * slug checker/compare
   * @param {string}​ slug - slug value
   * @return {boolean} check slug if already exist
   */
  const checkSlugExist = async (slug) => {
    const isSlugExist = await checkSlug(encodeURIComponent(slug));
    if (isSlugExist?.data.length > 0) {
      if (match.params.id) {
        if (isSlugExist?.data[0]?.tag_id?.toString() === match.params.id) {
          setIsSlugExist(false);
          return false;
        } else {
          setIsSlugExist(true);
          return true;
        }
      } else {
        setIsSlugExist(true);
        return true;
      }
    } else {
      setIsSlugExist(false);
      return false;
    }
  };

  /**
   * tag name checker/compare
   * @param {string}​ name - tag name value
   * @return {boolean} check tag name if already exist
   */
  const checkIfTagNameExist = async (name) => {
    if (data && isNotEmptyString(name)) {
      const isExist = await getAllTag(`?name=${encodeURIComponent(name)}`);
      if (isExist?.data?.length > 0) {
        if (
          match.params.id &&
          isExist?.data[0]?.tag_id?.toString() === match.params.id?.toString()
        ) {
          setIsValid({
            ...isValid,
            name: true,
          });
          return false;
        } else {
          setIsValid({
            ...isValid,
            name: false,
          });
          setValid(false);
          return true;
        }
      } else {
        setIsValid({
          ...isValid,
          name: true,
        });
        return false;
      }
    } else {
      setValid(false);
      return false;
    }
  };

  /**
   * validate slug and tag name if exist
   * @param {string}​ modalType - modalName
   * @return {boolean} validate slug and tag name
   */
  const validate = async (modalType) => {
    setIsSaving(true);
    const isSlugExist = await checkSlugExist(data.slug);
    const isTagNameExist = await checkIfTagNameExist(data.name);
    if (!isTagNameExist && !isSlugExist && isNotEmptyString(data.name)) {
      setValid(true);
      modalType === "addModal"
        ? toggleAddModal(modalType, data)
        : toggleEditModal(modalType, data);
    } else {
      setValid(false);
    }
    setIsSaving(false);
  };

  useEffect(() => {
    !match.params.id && handleChange("slug", formatSlug(data.name));
  }, [data.name]); /* eslint-disable-line*/

  // load tag data by id
  const loadData = async () => {
    setIsHandling(true);
    dispatch(
      actionTools?.updateBreadCrumbs({
        ...breadCrumbs,
        tags: "",
      })
    );
    const response = await getTagById(match.params.id);
    if (!response.successful && response.message === "Tag does not exists!") {
      setIsNotValidTagId(true);
    } else {
      if (response) {
        setData(response);
        dispatch(
          actionTools?.updateBreadCrumbs({
            ...breadCrumbs,
            tags: response.name,
          })
        );
        setIsNotValidTagId(false);
      }
    }
    setIsHandling(false);
  };

  // check if current user is allowed to disable tag
  const isDisableSaveButton = () => {
    if (isEdit) {
      if (isAllowedToEdit) {
        return false;
      } else if (isAllowedToDisable) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  useEffect(() => {
    match.params.id
      ? loadData()
      : dispatch(
          actionTools?.updateBreadCrumbs({
            ...breadCrumbs,
            tags: "",
          })
        );
  }, []); //eslint-disable-line

  return (
    <>
      {addModal.open && (
        <Modal
          loading={isSaving}
          show={addModal.open}
          toggle={() => toggleAddModal("addModal", null)}
          headerText="Are you sure to create this tag?"
          closeText="Cancel and go back to form"
          callbackText="Continue and add tag"
          onCallback={() => handleAdd()}
          buttonType="info"
        >
          <div className="text-center">
            <p>Tag: {data.name}</p>
          </div>
        </Modal>
      )}
      {editModal.open && (
        <Modal
          loading={isSaving}
          show={editModal.open}
          toggle={() => toggleEditModal("editModal", null)}
          headerText="Are you sure to update this tag?"
          closeText="Cancel and go back to form"
          callbackText="Continue and edit tag"
          onCallback={() => handleEdit()}
          buttonType="info"
        >
          <div className="text-center">
            <p>Tag: {data.name}</p>
          </div>
        </Modal>
      )}
      {isNotValidTagId ? (
        <CAlert color="info">
          <h3>Something went wrong!</h3>
          <p>
            Tag maybe deleted or does not exist. please go back to &nbsp;
            <CLink className="font-weight-bold" to="/tools/tags">
              dashboard
            </CLink>
          </p>
        </CAlert>
      ) : isHandling ? (
        <CSpinner color="secondary" size="lg" className="screen-loading" />
      ) : (
        <CCard>
          <CCardHeader>
            <h5 className="mb-0 float-left pt-2">Tag Form</h5>
            {data.tag_id !== 0 ? (
              <CButton
                className="d-flex mx-2 float-right"
                size="md"
                color="info"
                onClick={() => validate("editModal")}
                disabled={isDisableSaveButton()}
              >
                Save
                {isSaving && <CSpinner size="sm" color="secondary ml-2" />}
              </CButton>
            ) : (
              <CButton
                className="d-flex mx-2 float-right"
                size="md"
                color="info"
                onClick={() => validate("addModal")}
                disabled={!isAllowedToCreate}
              >
                Save
                {isSaving && <CSpinner size="sm" color="secondary ml-2" />}
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol lg="12" className="mb-3">
                <CLabel>Tag</CLabel>
                <CInput
                  onChange={(e) => handleChange("name", e.target.value)}
                  type="text"
                  className="text-dark"
                  value={data.name}
                  invalid={!valid && !isNotEmptyString(data?.name)}
                  disabled={isEdit && !isAllowedToEdit}
                />
                {isValid.name ? (
                  ""
                ) : (
                  <small className="help-block text-danger mb-0">
                    Sorry, That Tag is already taken. Please provide another
                    one.
                  </small>
                )}
                {!valid && !isNotEmptyString(data?.name) && (
                  <small className="help-block text-danger mb-0">
                    This field is required.
                  </small>
                )}
              </CCol>
              <CCol lg="12" className="mb-3">
                <CLabel>Slug</CLabel>
                <CInput
                  onChange={(e) => handleChange("slug", e.target.value)}
                  type="text"
                  className="text-dark"
                  value={data.slug}
                  disabled
                />
                {isNotEmptyString(data.slug) && isSlugExist && (
                  <small className="text-danger mt-2">
                    The slug has already been taken.
                  </small>
                )}
              </CCol>
              <CCol lg="12" className="mb-3">
                <CLabel>Type</CLabel>
                <CSelect
                  onChange={(e) => handleChange("type", e.target.value)}
                  value={data.type}
                  custom
                  className="d-block w-100"
                  disabled={isEdit && !isAllowedToEdit}
                >
                  <option value={1}>Visible</option>
                  {/* <option value={0}>Invisible</option> */}
                </CSelect>
              </CCol>
              <CCol lg="12" className="mb-3">
                <CLabel className="d-block w-100">Status</CLabel>
                <CSwitch
                  disabled={isEdit && !isAllowedToDisable}
                  size="lg"
                  color="success"
                  labelOff="Inactive"
                  labelOn="Active"
                  className={`cusEl ${
                    data?.status?.toString() === "1"
                      ? "active"
                      : "inactive"
                  }`}
                  checked={data?.status?.toString() === "1" ? true : false}
                  onChange={() =>
                    handleChange(
                      "status",
                      data?.status?.toString() === "1" ? 0 : 1
                    )
                  }
                />
                {/* <CSelect
                  onChange={(e) => handleChange("status", e.target.value)}
                  value={data.status}
                  custom
                  className="d-block w-100"
                  disabled={isEdit && !isAllowedToDisable}
                >
                  <option value={1}>Active</option>
                  <option value={0}>Disabled</option>
                </CSelect> */}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}
    </>
  );
};

export default TagForm;
