import React, { useState, useEffect } from "react";
import {
  CLabel,
  CInput,
  CRow,
  CCol,
  CCardBody,
  CCard,
  CCardHeader,
  CButton,
  CSpinner,
  CSwitch,
  CAlert,
  CLink,
} from "@coreui/react";
import Select from "react-select";
import * as EmailValidator from "email-validator";
import Modal from "components/Modal";
import { useDispatch, useSelector } from "react-redux";
import {
  isNotEmptyObject,
  isNotEmptyString,
  isNotEmptyArray,
  formatSlug,
} from "core/helpers";
import {
  createNewUser,
  getUserById,
  updateUserById,
  getAllUser,
  getRoleOps,
} from "core/services/user";
import * as masterActions from "store/master/actions";
import * as actionTools from "store/tools/actions";

const UserFormModal = ({ match }) => {
  const isEdit = match.params.id;
  const userPermissions = useSelector((state) => state.master.userPermissions);
  const breadCrumbs = useSelector((state) => state.tools.breadCrumbs);
  const isAllowedToEdit = userPermissions.includes("User.Edit");
  // const isAllowedToCreate = userPermissions.includes("User.Create");
  const isAllowedToDisable = userPermissions.includes("User.Disable");
  const dispatch = useDispatch();
  const [data, setData] = useState({
    email: "",
    role_id: [],
    status: 1,
    display_name: "",
    author_slug: "",
  });
  const [validEmaiAdd, setValidEmailAdd] = useState(true);
  const [alreadyExistSlug, setAlreadyExistSlug] = useState(false);
  const [alreadyExistEmail, setAlreadyExistEmail] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isHandlingSave, setIsHandlingSave] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNotValidUser, setNotValidUser] = useState(false);
  const [isPreviousAuthor, setIsPreviousAuthor] = useState(false);
  const [previousEmail, setPreviousEmail] = useState("");
  const [roleOps, setRoleOps] = useState([]);

   /**
   * fetch role name by role id
   * @param {number} role_id - user's role id
   */
  const getRole = (role_id) => {
    const filter = roleOps?.filter(
      (role) => role.value?.toString() === role_id?.toString()
    );
    return filter?.length > 0 ? filter[0] : [];
  };

  /**
   * fetch user data by id
   */
  const loadData = async () => {
    setIsLoading(true);
    dispatch(
      actionTools?.updateBreadCrumbs({
        ...breadCrumbs,
        user: "",
      })
    );
    //api call
    const userByIdData = await getUserById(match.params.id);
    //check if user exist
    if (
      !userByIdData.successful &&
      userByIdData.message === "User does not exists!"
    ) {
      setNotValidUser(true);
    } else {
      if (userByIdData && isNotEmptyObject(userByIdData)) {
        setNotValidUser(false);
        const {
          role_id,
          status,
          author_slug,
          email,
          display_name,
        } = userByIdData;
        //check if user is author (role id: 2)
        if (role_id?.toString() === "2") {
          setIsPreviousAuthor(true);
          setPreviousEmail(email);
        }
        dispatch(
          actionTools?.updateBreadCrumbs({
            ...breadCrumbs,
            user: display_name,
          })
        );
        //set to state
        setData({
          email: email,
          role_id: getRole(role_id),
          status: status,
          display_name: display_name,
          author_slug: author_slug,
        });
      }
    }
    setIsLoading(false);
  };

  /**
   * fetch all roles for the role option
   */
  const loadRoleOptions = async () => {
    setIsLoading(true);
    const res = await getRoleOps();
    if (res) {
      const formatToOps = res.map((role) => {
        return {
          value: role.role_id,
          label: role.name,
        };
      });
      setRoleOps(formatToOps);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadRoleOptions();
  }, []);

  useEffect(() => {
    match.params.id
      ? isNotEmptyArray(roleOps) && loadData(match.params.id)
      : dispatch(
          actionTools?.updateBreadCrumbs({
            ...breadCrumbs,
            user: "",
          })
        );
  }, [match.params.id, roleOps]); /*eslint-disable-line */

  /**
   * handles onChange of user form states
   */
  const handleOnChange = (type, value) => {
    if (type === "role_id") {
      if (
        isPreviousAuthor &&
        (value?.value === "2" || value?.value === 2) &&
        previousEmail === ""
      ) {
        setData({
          ...data,
          role_id: value,
          email: "",
        });
      } else {
        setData({
          ...data,
          [type]: value,
        });
      }
    } else {
      setData({
        ...data,
        [type]: value,
      });
    }
  };

  /**
   * validation if slug already exist
   */
  const checkIfSlugExist = async () => {
    if (data?.author_slug !== "") {
      const checkSlugExist = await getAllUser(
        `?author_slug=${encodeURIComponent(data?.author_slug)}`
      );
      //check if fetched data is same as the current user data
      if (!match.params.id && checkSlugExist?.data.length > 0) {
        setAlreadyExistSlug(true);
        return false;
      } else {
        setAlreadyExistSlug(false);
        return true;
      }
    } else {
      setAlreadyExistSlug(false);
      return true;
    }
  };

  /**
   * validation if email already exist
   */
  const checkIfEmailExist = async () => {
    const checkEmailExist = await getAllUser(
      `?email=${encodeURIComponent(data?.email)}`
    );
    if (checkEmailExist?.data.length > 0) {
      if (checkEmailExist?.data[0]?.user_id?.toString() === match.params.id) {
        setAlreadyExistEmail(false);
        return true;
      } else {
        setAlreadyExistEmail(true);
        return false;
      }
    } else {
      setAlreadyExistEmail(false);
      return true;
    }
  };

  /**
   * validation if all fields are valid
   */
  const isValidated = async () => {
    setIsHandlingSave(true);
    const { role_id, status, author_slug, email, display_name } = data;
    const validEmail = EmailValidator.validate(data.email);
    setValidEmailAdd(validEmail);
    const isSlugExist = await checkIfSlugExist();
    //check if role id is author
    if (role_id?.value?.toString() !== "2") {
      const isEmailExist = await checkIfEmailExist();
      const isValidated =
        (isNotEmptyArray(role_id) || isNotEmptyObject(role_id)) &&
        role_id.value &&
        status !== "" &&
        isNotEmptyString(author_slug) &&
        isNotEmptyString(email) &&
        isNotEmptyString(display_name);

      if (isValidated && validEmail && isSlugExist && isEmailExist) {
        setShowError(false);
        setConfirmationModal(true);
      } else {
        setShowError(true);
      }
    } else {
      const isValidated =
        (isNotEmptyArray(role_id) || isNotEmptyObject(role_id)) &&
        role_id.value &&
        status !== "" &&
        isNotEmptyString(author_slug) &&
        isNotEmptyString(display_name);
      if (isValidated && isSlugExist) {
        if (isNotEmptyString(email)) {
          const isEmailExist = await checkIfEmailExist();
          if (validEmail) {
            if (isEmailExist) {
              setShowError(false);
              setConfirmationModal(true);
            } else {
              setShowError(true);
            }
          } else {
            setShowError(true);
          }
        } else {
          setShowError(false);
          setConfirmationModal(true);
        }
      } else {
        setShowError(true);
      }
    }
    setIsHandlingSave(false);
  };

  /**
   * handles creating / editing a user
   */
  const handleSave = async () => {
    const { role_id, status, display_name, author_slug } = data;
    setIsHandlingSave(true);
    try {
      let res;
      if (match.params.id) {
        let payload;
        if (role_id?.value?.toString() === "2") {
          payload = {
            role_id: role_id.value?.toString(),
            status: status?.toString(),
            display_name: display_name,
            author_slug: author_slug,
          };
        } else {
          payload = {
            ...data,
            role_id: role_id.value?.toString(),
            status: status?.toString(),
          };
        }
        res = await updateUserById(payload, match.params.id);
      } else {
        res = await createNewUser({
          ...data,
          role_id: role_id.value?.toString(),
          status: status,
          source: "quill_2",
          main_website: "1",
        });
      }
      if (res?.successful) {
        dispatch(
          masterActions.updateNotificationModal({
            open: true,
            type: "success",
            bodyText: res?.message,
            callback: async (closeModal) => {
              closeModal();
              if (!match.params.id) {
                window.location.href = `/tools/user-form/${res.user_id}`;
              } else {
                window.location.href = `/tools/user-form/${match.params.id}`;
              }
            },
          })
        );
      } else {
        dispatch(
          masterActions.updateNotificationModal({
            open: true,
            type: "error",
            bodyText: res?.message,
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
    setConfirmationModal(!confirmationModal);
    setIsHandlingSave(false);
  };

  useEffect(() => {
    if (!match.params.id) {
      handleOnChange("author_slug", formatSlug(data.display_name));
    }
  }, [data.display_name]); /*eslint-disable-line */


  /**
   * check user permissions whether to disable the save button
   */
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

  return (
    <>
      {isNotValidUser ? (
        <CAlert color="info">
          <h3>Something went wrong!</h3>
          <p>
            User maybe deleted or does not exist. please go back to &nbsp;
            <CLink className="font-weight-bold" to="/tools/users">
              dashboard
            </CLink>
          </p>
        </CAlert>
      ) : (
        <CRow>
          <CCol>
            {isLoading ? (
              <CSpinner
                color="secondary"
                size="lg"
                className="screen-loading"
              />
            ) : (
              <CCard>
                <CCardHeader>
                  <h5 className="float-left pt-2">User Form</h5>
                  <CButton
                    color="info"
                    className="px-4 float-right"
                    size="md"
                    onClick={() => isValidated()}
                    disabled={isDisableSaveButton()}
                  >
                    Save
                    {isHandlingSave && (
                      <CSpinner size="sm" color="secondary ml-2" />
                    )}
                  </CButton>
                </CCardHeader>
                <CCardBody>
                  <CRow>
                    <CCol lg="6" className="mb-3">
                      <CLabel>
                        {(isNotEmptyArray(data.role_id) ||
                          isNotEmptyObject(data.role_id)) &&
                          data?.role_id?.value?.toString() !== "2" && (
                            <span className="text-danger mr-1">*</span>
                          )}
                        Email Address
                      </CLabel>
                      <CInput
                        disabled={
                          match.params.id
                            ? isPreviousAuthor &&
                              data?.role_id?.value?.toString() !== "2" &&
                              !isNotEmptyString(previousEmail)
                              ? false
                              : true
                            : false
                        }
                        value={data.email}
                        onChange={(e) =>
                          handleOnChange("email", e.target.value)
                        }
                        type="email"
                        placeholder="Enter Email Address"
                      />
                      {showError &&
                        (isNotEmptyArray(data.role_id) ||
                          isNotEmptyObject(data.role_id)) &&
                        data?.role_id?.value?.toString() !== "2" &&
                        !isNotEmptyString(data.email) && (
                          <small className="text-danger mt-2">
                            Email Address is required!
                          </small>
                        )}
                      {showError &&
                        (isNotEmptyArray(data.role_id) ||
                          isNotEmptyObject(data.role_id)) &&
                        // data?.role_id?.value?.toString() === "2" &&
                        isNotEmptyString(data.email) &&
                        validEmaiAdd === false && (
                          <small className="text-danger mt-2">
                            Invalid Email Address!
                          </small>
                        )}
                      {isNotEmptyString(data.email) &&
                        validEmaiAdd &&
                        alreadyExistEmail && (
                          <small className="text-danger mt-2">
                            Email Address is already existing.
                          </small>
                        )}
                    </CCol>
                    <CCol lg="6 mb-3">
                      <CLabel>
                        <span className="text-danger mr-1">*</span>Role
                      </CLabel>
                      <Select
                        value={
                          isNotEmptyArray(data.role_id) ||
                          isNotEmptyObject(data.role_id)
                            ? data.role_id
                            : []
                        }
                        onChange={(value) => handleOnChange("role_id", value)}
                        options={roleOps}
                        placeholder="Select Role"
                        components={{
                          IndicatorSeparator: () => null,
                        }}
                        isSearchable={false}
                        isClearable
                        isDisabled={isEdit && !isAllowedToEdit}
                      />
                      {showError &&
                        (!(
                          isNotEmptyArray(data.role_id) ||
                          isNotEmptyObject(data.role_id)
                        ) ||
                          (data.role_id && !data.role_id.value)) && (
                          <small className="text-danger mt-2">
                            Role is required!
                          </small>
                        )}
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol lg="6" className="mb-3">
                      <CLabel>
                        <span className="text-danger mr-1">*</span>Status
                      </CLabel>
                      <div>
                        <CSwitch
                          disabled={isEdit ? !isAllowedToDisable : true}
                          size="lg"
                          color="success"
                          labelOff="Inactive"
                          labelOn="Active"
                          className={`cusEl ${
                            data?.status?.toString() === "1"
                              ? "active"
                              : "inactive"
                          }`}
                          checked={
                            data?.status?.toString() === "1" ? true : false
                          }
                          onChange={() =>
                            handleOnChange(
                              "status",
                              data?.status?.toString() === "1" ? 0 : 1
                            )
                          }
                        />
                      </div>
                    </CCol>
                    <CCol lg="6" className="mb-3">
                      <CLabel>
                        <span className="text-danger mr-1">*</span>
                        Display Name
                      </CLabel>
                      <CInput
                        value={data.display_name}
                        onChange={(e) =>
                          handleOnChange("display_name", e.target.value)
                        }
                        type="text"
                        placeholder="Enter Display Name"
                        disabled={isEdit && !isAllowedToEdit}
                      />
                      {showError && !isNotEmptyString(data.display_name) && (
                        <small className="text-danger">
                          Display Name is required!
                        </small>
                      )}
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol lg="6" className="mb-3">
                      <CLabel>
                        <span className="text-danger mr-1">*</span>
                        Author Slug
                      </CLabel>
                      <CInput
                        value={data.author_slug}
                        onChange={(e) =>
                          handleOnChange("author_slug", e.target.value)
                        }
                        onBlur={() =>
                          handleOnChange(
                            "author_slug",
                            formatSlug(data.author_slug)
                          )
                        }
                        type="text"
                        placeholder="Enter Author Slug"
                        disabled={match.params.id}
                      />
                      {showError && !isNotEmptyString(data.author_slug) && (
                        <small className="text-danger mt-2">
                          Author Slug is required!
                        </small>
                      )}
                      {isNotEmptyString(data.author_slug) &&
                        alreadyExistSlug && (
                          <small className="text-danger mt-2">
                            The slug has already been taken.
                          </small>
                        )}
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            )}
          </CCol>
        </CRow>
      )}
      {confirmationModal && (
        <Modal
          show={confirmationModal}
          toggle={() => setConfirmationModal(!confirmationModal)}
          headerText={
            match.params.id
              ? "Are you sure you want to update this user?"
              : "Are you sure you want to add this user?"
          }
          closeText="Cancel"
          callbackText="Continue"
          onCallback={() => handleSave()}
          buttonType="success"
          loading={isHandlingSave}
        >
          <div className="text-center">
            <h4>{data.email || data.display_name}</h4>
            <p>
              Role: <span className="secondary">{data.role_id.label}</span>
            </p>
          </div>
        </Modal>
      )}
    </>
  );
};

export default UserFormModal;
