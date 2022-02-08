import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import RightModal from "../right-modal";
import {
  CCard,
  CInput,
  CFormText,
  CTextarea,
  CAlert,
  CRow,
  CCol,
  CTooltip,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CSpinner,
} from "@coreui/react";
import { useDispatch } from "react-redux";
import {
  updateUserProfile,
  changeProfilePassword,
  loginWithEmailAndPassword,
  getUserProfile,
} from "core/services/user";
import mimeTypes from "core/mime";
import {
  isNotEmptyObject,
  isNotEmptyString,
  isFileSupport,
} from "core/helpers";
import {
  facebookUsername,
  instagramUsername,
  twitterUsername,
  passwordValidation,
} from "core/regex";
import * as masterActions from "store/master/actions";
import defaultImg from "assets/images/avatars/default_user_icon.png";
import "./style.scss";

const uploadOptions = {
  maxFileSize: 1, //mb
  supportFormat: ["jpeg", "jpg", "png", "gif", "webp"],
};

// const corePlugins = [
//   "Article",
//   "ImageLibrary",
//   "Section",
//   "Tags",
//   "Role",
//   "User",
// ];

const EditProfileModal = ({
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
}) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.master.currentUser);
  const [isHandlingSave, setIsHandlingSave] = useState(false);
  const [isHandling, setIsHandling] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [preview, setPreview] = useState("");
  const [alert, setAlert] = useState({
    show: false,
    text: "",
    type: "",
  });

  //change password
  //old pw
  const [password, setPassword] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [oldPasswordError, setOldPasswordError] = useState(false);
  //new pw
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordType, setNewPasswordType] = useState("password");
  const [newPasswordError, setNewPasswordError] = useState(false);

  //confirm pw
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  const [userData, setUserData] = useState({
    display_name: "",
    description: "",
    facebook: "",
    twitter: "",
    instagram: "",
    position: "",
    image: null,
    permisssions: [],
  });

  const [isValidImage, setIsValidImage] = useState({
    size: true,
    name: true,
  });

  const [isValid, setIsValid] = useState({
    description: true,
    facebook: true,
    twitter: true,
    instagram: true,
    display_name: true,
  });

  // const [isFullAccess, setIsFullAccess] = useState({
  //   Article: true,
  //   ImageLibrary: true,
  //   Section: true,
  //   Tag: true,
  //   Role: true,
  //   User: true,
  // });
  // const [plugins, setPlugins] = useState([]);

  // const handlePermissionChange = (type, value) => {
  //   setIsFullAccess({
  //     ...isFullAccess,
  //     [type]: value,
  //   });
  // };

  // load current user details
  const loadData = async () => {
    setIsHandling(true);
    const userInfo = await loginWithEmailAndPassword();
    const userProfile = await getUserProfile();
    dispatch(masterActions.updateUser(userInfo));
    if (userInfo && isNotEmptyObject(userInfo) && userProfile) {
      setUserData({
        ...userProfile,
        display_name: isNotEmptyString(userInfo.display_name)
          ? userInfo.display_name
          : currentUser?.display_name,
        image:
          userProfile?.image && userProfile?.image !== null
            ? userProfile?.image
            : "",
      });
    }
    // const userPermissions = currentUser?.permissions;
    // const permissionList = await getPermissionGroupList("");
    // const formatted = permissionList?.data?.map((item) => {
    //   return {
    //     [item.plugin]: item.permissions.map((p) => p.code.split(".")[1]),
    //   };
    // });
    // const y = {};
    // formatted.forEach(
    //   (data) => (y[Object.keys(data)[0]] = data[Object.keys(data)[0]])
    // );
    // Object.keys(formatPermissionData(userPermissions)).forEach((data) =>
    //   handlePermissionChange(
    //     data,
    //     y[data]?.length === formatPermissionData(userPermissions)[data]?.length
    //   )
    // );
    // setPlugins(Object.keys(formatPermissionData(userPermissions)));
    setIsHandling(false);
  };

  useEffect(() => {
    loadData();
  }, []); //eslint-disable-line

  // const formatPermissionData = (data) => {
  //   const key = data
  //     ?.map((permission) => permission.split(".")[0])
  //     ?.filter((item, i, ar) => ar.indexOf(item) === i);
  //   let o = {};
  //   key?.forEach((key) => {
  //     o[key] = [];
  //   });
  //   data?.forEach(
  //     (permission) =>
  //       (o[permission.split(".")[0]] = [
  //         ...o[permission.split(".")[0]],
  //         permission.split(".")[1],
  //       ])
  //   );
  //   return o;
  // };

  /**
   * fields onchange handler
   * @param {string}​ type - input field name
   * @param {string | number}​ value - input field value
   * @return {object} updated object
   */
  const handleChange = (type, value) => {
    setUserData({
      ...userData,
      [type]: value,
    });
  };

  /**
   * fields onblur handler
   * @param {string}​ type - input field name
   * @param {string}​ regex - input field validation
   * @param {string | number}​ stateValue - input field value
   * @return {object} updated object
   */
  const handleOnBlur = (type, regex, stateValue) => {
    if (stateValue === "" || stateValue === null || !stateValue) {
      setIsValid({
        ...isValid,
        [type]: true,
      });
    } else {
      if (stateValue.match(regex)) {
        setIsValid({
          ...isValid,
          [type]: true,
        });
      } else {
        setIsValid({
          ...isValid,
          [type]: false,
        });
      }
    }
  };

  // Save edited current user details
  const handleSave = async () => {
    if (isValid.facebook && isValid.twitter && isValid.instagram) {
      if (isNotEmptyString(userData.display_name)) {
        setIsValid({
          ...isValid,
          display_name: true,
        });
        setIsHandlingSave(true);
        const {
          description,
          facebook,
          twitter,
          instagram,
          position,
          image,
          display_name,
        } = userData;
        const payloadData = new FormData();
        payloadData.append(
          "description",
          isNotEmptyString(description) ? description : ""
        );
        payloadData.append(
          "facebook",
          isNotEmptyString(facebook) ? facebook : ""
        );
        payloadData.append("twitter", isNotEmptyString(twitter) ? twitter : "");
        payloadData.append(
          "instagram",
          isNotEmptyString(instagram) ? instagram : ""
        );
        payloadData.append(
          "position",
          isNotEmptyString(position) ? position : ""
        );
        payloadData.append(
          "display_name",
          isNotEmptyString(display_name) ? display_name : ""
        );
        payloadData.append("image", image);
        try {
          let res = await updateUserProfile(payloadData);
          if (res.successful) {
            setIsHandlingSave(false);
            setAlert({
              open: true,
              text: "Edits have been successfully saved!",
              type: "success",
            });
            setPreview("");
            setIsValidImage({
              size: true,
              name: true,
            });
            loadData();
          } else {
            setIsHandlingSave(false);
            setAlert({
              open: true,
              text: "Failed saving edits, please try again",
              type: "danger",
            });
          }
        } catch (error) {
          setIsHandlingSave(false);
          setAlert({
            open: true,
            text: "Failed saving edits, please try again",
            type: "danger",
          });
        }
        setIsHandlingSave(false);
      } else {
        setIsValid({
          ...isValid,
          display_name: false,
        });
      }
    }
  };

  /**
   * convert byte to mb
   * @param {number}​ byteCount - file/image size
   * @return {number} converted number
   */
  const byteToMB = (byteCount) => {
    let bytePerMb = 1000000;
    return byteCount / bytePerMb;
  };

  /**
   * store selected file to input field
   * @param {object}​ e - input field onchange reference
   */
  const uploadImage = (e) => {
    if (e.target.files?.length === 1) {
      const file = e.target.files[0];
      if (
        !isFileSupport(
          uploadOptions.supportFormat,
          mimeTypes[file.type],
          file.name
        )
      ) {
        setIsValidImage({
          ...isValidImage,
          name: false,
        });
      } else {
        setIsValidImage({
          ...isValidImage,
          name: true,
        });
        //check file size > 1mb
        if (byteToMB(file.size) <= uploadOptions.maxFileSize) {
          const convert = URL.createObjectURL(file);
          setIsValidImage({
            size: true,
            name: true,
          });
          setPreview(convert);
          handleChange("image", file);
        } else {
          setIsValidImage({
            ...isValidImage,
            size: false,
          });
        }
      }
    }
  };

  // validate and change current user password handler
  const handleChangePassword = async () => {
    if (
      isNotEmptyString(password) &&
      isNotEmptyString(newPassword) &&
      isNotEmptyString(confirmPassword)
    ) {
      setOldPasswordError(false);
      setInvalid(false);
      if (newPassword.match(passwordValidation)) {
        if (newPassword === confirmPassword) {
          try {
            setLoading(true);
            const res = await changeProfilePassword({
              old_password: password,
              password: newPassword,
              confirm_password: confirmPassword,
            });
            if (res.successful) {
              setOldPasswordError(false);
              dispatch(
                masterActions.updateNotificationModal({
                  open: true,
                  type: "success",
                  bodyText: "Your Password has been changed!",
                  callback: async (closeModal) => {
                    setPassword("");
                    setPasswordType("password");
                    setOldPasswordError(false);
                    setNewPasswordType("password");
                    setNewPasswordError(false);
                    setNewPassword("");
                    setConfirmPassword("");
                    setConfirmPasswordType("password");
                    setConfirmPasswordError(false);
                    setLoading(false);
                    setInvalid(false);

                    closeModal();
                    setEditModal(false);
                  },
                })
              );
              setLoading(false);
            } else if (!res.successful && res.message === "Password is incorrect." && newPassword === confirmPassword) {
              setInvalid(true);
              setOldPasswordError(true);
              setConfirmPasswordError(false);
            } else {
              if (res.message === "Request failed with status code 401") {
                setOldPasswordError(true);
                setInvalid(true);
              } else {
                dispatch(
                  masterActions.updateNotificationModal({
                    open: true,
                    type: "error",
                    bodyText: "Failed Changing your password please try again",
                    callback: async (closeModal) => {
                      closeModal();
                    },
                  })
                );
              }
            }
            setLoading(false);
          } catch (error) {
            dispatch(
              masterActions.updateNotificationModal({
                open: true,
                type: "error",
                bodyText: JSON.stringify(error),
                callback: async (closeModal) => {
                  closeModal();
                },
              })
            );
            setLoading(false);
          }
        } else {
          setInvalid(true);
          setConfirmPasswordError(true);
        }
      } else {
        setOldPasswordError(false);
        setNewPasswordError(true);
        setInvalid(true);
      }
    } else {
      setInvalid(true);
    }
  };

  // function allTrue(obj) {
  //   for (var o in obj) if (!obj[o]) return false;
  //   return true;
  // }

  return (
    <>
      <RightModal
        show={show}
        onClose={onClose}
        className="mb-3 _profile-modal"
        innerRef={innerRef}
        centered={centered}
        size="lg"
        backdrop={backdrop}
        color={color}
        borderColor={borderColor}
        onOpened={onOpened}
        onClosed={onClosed}
        fade={fade}
        saveButton="Save"
        footer
        handleSave={() => handleSave()}
        isLoading={isHandlingSave}
      >
        {alert.open && (
          <CAlert color={alert.type}>
            {alert.text}
            <span
              className="material-icons float-right"
              onClick={() =>
                setAlert({
                  open: false,
                  type: "",
                  text: "",
                })
              }
            >
              close
            </span>
          </CAlert>
        )}
        <h4 className="mb-4">Edit Profile</h4>
        <CCard
          className="_card-profile p-2"
          style={{ position: "relative", marginBottom: "50px" }}
        >
          {isHandling ? (
            <CSpinner color="secondary" />
          ) : (
            <React.Fragment>
              <CRow className="mb-3">
                <CCol md="2" className="mb-2">
                  <div className="position-relative">
                    <img
                      className="w-100"
                      src={
                        preview !== ""
                          ? preview
                          : userData.image === "" ||
                            userData.image === "null" ||
                            userData.image === null
                          ? defaultImg
                          : userData.image
                      }
                      alt="..."
                    />
                    <label
                      className="position-absolute"
                      style={{
                        top: "0",
                        right: "0",
                      }}
                    >
                      <CTooltip content="Upload image">
                        <p
                          style={{ fontSize: "30px !important" }}
                          className="material-icons md-48 m-auto"
                        >
                          upload
                        </p>
                      </CTooltip>
                      <CInput
                        className="d-none"
                        type="file"
                        name="file"
                        onChange={(e) => uploadImage(e)}
                        accept="image/*"
                      />
                    </label>
                  </div>
                </CCol>
                <CCol md="10" className="mb-2">
                  <div className="py-4">
                    <p className="mb-0">
                      <small>User ID: {userData.user_id || ""}</small>
                    </p>
                    <h1 className="mb-0">
                      {currentUser && currentUser?.display_name}
                    </h1>
                    <p className="mb-0">{currentUser && currentUser?.email}</p>
                  </div>
                </CCol>
                <CCol sm="12">
                  {!isValidImage.size && (
                    <small className="help-block mb-0 text-danger">
                      The image can't be uploaded, because it exceed the maximum
                      allowed file size (1MB)
                    </small>
                  )}
                  {!isValidImage.name && (
                    <small className="help-block mb-0 text-danger">
                      The image type is not allowed. Please make sure that the
                      image type is either jpeg, png, webp, or gif.
                    </small>
                  )}
                  <CFormText className="help-block">
                    &#9432; &nbsp; Image should be 300x300px with a maximum file
                    size of 1MB
                  </CFormText>
                </CCol>
              </CRow>

              <div className="mb-3 field-password">
                <div className="d-flex justify-content-between">
                  <h5 className="mb-1">Password</h5>
                  <CButton
                    onClick={() => setEditModal(true)}
                    color="info"
                    size="sm"
                    variant="ghost"
                    className="mb-1"
                  >
                    EDIT
                  </CButton>
                </div>
                <div className="mb-2">
                  <CInput
                    type="password"
                    value="samplepassword"
                    readOnly
                    disabled
                  />
                  <CFormText className="help-block">
                    &#9432; &nbsp; Must be at least 8 characters with no spaces
                    and contain at least 1 number.
                  </CFormText>
                </div>
              </div>

              <div className="area-permission mb-3">
                <h5 className="mb-1">Active Permissions</h5>
                <div className="active-permission d-flex mb-2">
                  <div className="item">Quill 2.0</div>
                  <div className="item">{currentUser?.role_name} </div>
                  <div className="item">{currentUser?.role_description}</div>
                </div>
                {/* {corePlugins?.length === plugins.length &&
                allTrue(isFullAccess) ? (
                  <div className="active-permission d-flex mb-2">
                    <div className="item">Quill 2.0</div>
                    <div className="item">
                      {currentUser?.role_name?.charAt(0).toUpperCase() +
                        currentUser?.role_name?.slice(1)}{" "}
                      | Quill 2.0 - Full Access
                    </div>
                  </div>
                ) : (
                  plugins?.map((data) => {
                    return formatPermissionData(currentUser?.permissions)[
                      data
                    ]?.map((item, i) => (
                      <div className="active-permission d-flex mb-2" key={i}>
                        <div className="item">Quill 2.0</div>
                        <div className="item">{data}</div>
                        <div className="item">
                          {currentUser?.role_name.charAt(0).toUpperCase() +
                            currentUser?.role_name.slice(1)}{" "}
                          | {item}
                        </div>
                      </div>
                    ));
                    // if (isFullAccess[data]) {
                    //   return (
                    //     <div
                    //       className="active-permission d-flex mb-2"
                    //       key={index}
                    //     >
                    //       <div className="item">Quill 2.0</div>
                    //       <div className="item">{data}</div>
                    //       <div className="item">
                    //         {currentUser?.role_name?.charAt(0).toUpperCase() +
                    //           currentUser?.role_name?.slice(1)}{" "}
                    //         | Quill 2.0 - Full Access
                    //       </div>
                    //     </div>
                    //   );
                    // } else {

                    // }
                  })
                )} */}
              </div>
              <form autoComplete="off">
                <h5 className="mb-1">Display Name</h5>
                <div className="mb-2">
                  <CInput
                    className="w-100"
                    type="text"
                    value={userData.display_name || ""}
                    onChange={(e) =>
                      handleChange("display_name", e.target.value)
                    }
                    invalid={!isValid.display_name}
                  />
                  {!isValid.display_name && (
                    <small className="help-block text-danger mb-0">
                      This field is required.
                    </small>
                  )}
                  <CFormText className="help-block">
                    &#9432; &nbsp; Name display on the site
                  </CFormText>
                </div>
                {/* <h5>Position</h5>
                <div className='mb-3'>
                  <CInput
                    className='w-100'
                    type="text"
                    value={userData.position === null ? '' : userData.position}
                    onChange={ (e) => handleChange('position', e.target.value) }
                  />
                  <CFormText className="help-block">
                    &#9432; &nbsp;
                    Position displays on the site author profile
                  </CFormText>
                </div> */}
                <h5>Description</h5>
                <div className="mb-3">
                  <CTextarea
                    className="w-100"
                    maxLength={160}
                    type="text"
                    value={
                      userData.description === null ? "" : userData.description
                    }
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                  />
                  <CFormText className="help-block d-flex justify-content-between">
                    <p className="mb-0">
                      &#9432; &nbsp; Provide a short description about yourself.
                      Maximum length of 160 characters.
                    </p>
                    <p className="mb-0 text-secondary">
                      {userData?.description?.length} / 160
                    </p>
                  </CFormText>
                </div>
                <h5>Facebook</h5>
                <div className="mb-2">
                  <CInput
                    className="w-100"
                    type="text"
                    value={userData.facebook === null ? "" : userData.facebook}
                    onChange={(e) => handleChange("facebook", e.target.value)}
                    onBlur={() =>
                      handleOnBlur(
                        "facebook",
                        facebookUsername,
                        userData.facebook
                      )
                    }
                    invalid={!isValid.facebook}
                    placeholder="https://www.facebook.com/user"
                  />
                  {!isValid.facebook && (
                    <span className="text-danger small">
                      The facebook format is invalid.
                    </span>
                  )}
                  <CFormText className="help-block">
                    &#9432; &nbsp; Please enter your Facebook URL
                  </CFormText>
                </div>
                <h5>Instagram</h5>
                <div className="mb-2">
                  <CInput
                    className="w-100"
                    type="text"
                    value={
                      userData.instagram === null ? "" : userData.instagram
                    }
                    onChange={(e) => handleChange("instagram", e.target.value)}
                    onBlur={() =>
                      handleOnBlur(
                        "instagram",
                        instagramUsername,
                        userData.instagram
                      )
                    }
                    invalid={!isValid.instagram}
                    placeholder="https://www.instagram.com/user"
                  />
                  {!isValid.instagram && (
                    <span className="text-danger small">
                      The Instagram format is invalid.
                    </span>
                  )}
                  <CFormText className="help-block">
                    &#9432; &nbsp; Please enter your Instagram URL
                  </CFormText>
                </div>
                <h5>Twitter</h5>
                <div className="mb-2">
                  <CInput
                    className="w-100"
                    type="text"
                    value={userData.twitter === null ? "" : userData.twitter}
                    onChange={(e) => handleChange("twitter", e.target.value)}
                    onBlur={() =>
                      handleOnBlur("twitter", twitterUsername, userData.twitter)
                    }
                    invalid={!isValid.twitter}
                    placeholder="https://www.twitter.com/user"
                  />
                  {!isValid.twitter && (
                    <span className="text-danger small">
                      The Twitter format is invalid.
                    </span>
                  )}
                  <CFormText className="help-block">
                    &#9432; &nbsp; Please enter your Twitter URL
                  </CFormText>
                </div>
              </form>
            </React.Fragment>
          )}
        </CCard>
      </RightModal>
      <div className="edit-profile-container">
        <CModal
          size="lg"
          show={editModal}
          onClose={() => setEditModal(!editModal)}
          className="_modal-right edit-profile-modal"
          closeOnBackdrop={false}
        >
          <div style={{ backgroundColor: "#fff" }}>
            <CModalHeader
              className="p-1"
              closeButton
              style={{ flexDirection: "row-reverse" }}
            >
              <CButton
                className="d-block mb-0"
                color="info"
                disabled={loading}
                onClick={() => handleChangePassword()}
              >
                {loading ? "Saving" : "Save"}
                {loading && (
                  <CSpinner className="ml-2" size="sm" color="secondary" />
                )}
              </CButton>
            </CModalHeader>
            <CModalBody>
              <CCard className="p-2">
                <h5 className="mb-1">Current Password</h5>
                <div className="mb-3">
                  <div className="position-relative">
                    <CInput
                      type={passwordType}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={
                        invalid &&
                        (!isNotEmptyString(password) || oldPasswordError)
                          ? "pr-5 border border-danger"
                          : "pr-5"
                      }
                    />
                    <span
                      className="material-icons position-absolute eye-pw"
                      onClick={() =>
                        passwordType === "password"
                          ? setPasswordType("text")
                          : setPasswordType("password")
                      }
                    >
                      {passwordType === "password"
                        ? "visibility_off"
                        : "visibility"}
                    </span>
                  </div>
                  {invalid && !isNotEmptyString(password) && (
                    <p className="text-danger mb-0 small">
                      This field is required.
                    </p>
                  )}
                  {isNotEmptyString(password) && oldPasswordError && (
                    <p className="text-danger mb-0 small">
                      Your current password is incorrect
                    </p>
                  )}
                </div>
                <h5 className="mb-1">New Password</h5>
                <div className="mb-3">
                  <div className="position-relative">
                    <CInput
                      type={newPasswordType}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={
                        invalid &&
                        (!isNotEmptyString(newPassword) || newPasswordError)
                          ? "pr-5 border border-danger"
                          : "pr-5"
                      }
                    />
                    <span
                      className="material-icons position-absolute eye-pw"
                      onClick={() =>
                        newPasswordType === "password"
                          ? setNewPasswordType("text")
                          : setNewPasswordType("password")
                      }
                    >
                      {newPasswordType === "password"
                        ? "visibility_off"
                        : "visibility"}
                    </span>
                  </div>
                  <CFormText className="help-block">
                    <span
                      className={
                        invalid &&
                        newPasswordError &&
                        isNotEmptyString(newPassword)
                          ? `text-danger help-block`
                          : ""
                      }
                    >
                      &#9432; Must be at least 8 characters with no spaces and
                      contain at least 1 number.
                    </span>
                  </CFormText>
                  {/* {invalid && newPasswordError && isNotEmptyString(newPassword) && (
                    <small
                      className="text-danger"
                    >
                      &#9432; Please use a better password.
                    </small>
                  )} */}
                  {invalid && !isNotEmptyString(newPassword) && (
                    <p className="text-danger mb-0 small">
                      This field is required.
                    </p>
                  )}
                </div>
                <h5 className="mb-1">Re-type Password</h5>
                <div className="mb-3">
                  <div className="position-relative">
                    <CInput
                      type={confirmPasswordType}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={
                        invalid &&
                        (!isNotEmptyString(confirmPassword) ||
                          confirmPasswordError)
                          ? "pr-5 border border-danger"
                          : "pr-5"
                      }
                    />
                    <span
                      className="material-icons position-absolute eye-pw"
                      onClick={() =>
                        confirmPasswordType === "password"
                          ? setConfirmPasswordType("text")
                          : setConfirmPasswordType("password")
                      }
                    >
                      {confirmPasswordType === "password"
                        ? "visibility_off"
                        : "visibility"}
                    </span>
                  </div>
                  {invalid && !isNotEmptyString(confirmPassword) && (
                    <p className="text-danger mb-0 small">
                      This field is required.
                    </p>
                  )}
                  {invalid &&
                    isNotEmptyString(confirmPassword) &&
                    confirmPasswordError && (
                      <p className="text-danger mb-0 small">
                        Passwords do not match.
                      </p>
                    )}
                </div>
              </CCard>
            </CModalBody>
          </div>
        </CModal>

        <div
          style={{ opacity: ".3" }}
          className={`modal-backdrop ${editModal ? "d-block" : "d-none"}`}
        ></div>
      </div>
    </>
  );
};

export default EditProfileModal;
