import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CCard,
  CInput,
  CFormText,
  CTextarea,
  CButton,
  CRow,
  CCol,
  CTooltip,
  CSpinner,
  CModal,
  CModalHeader,
  CBreadcrumb,
  CBreadcrumbItem,
  CModalBody,
} from "@coreui/react";
import defaultImg from "assets/images/avatars/default_user_icon.png";
import * as masterActions from "store/master/actions";
import {
  getUserById,
  changeProfilePassword,
  getRoleById,
  getPermissionGroupList,
} from "core/services/user";
import {
  isNotEmptyObject,
  isNotEmptyString,
  isNotEmptyArray,
} from "core/helpers";
import {
  facebookUsername,
  instagramUsername,
  twitterUsername,
  passwordValidation,
} from "core/regex";
import NotifModal from "components/NotifModal";
import "./style.scss";

const Profile = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.master.currentUser);
  // eslint-disable-next-line
  const [permissions, setPermissions] = useState([]);

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

  const [isValid, setIsValid] = useState({
    display_name: true,
    description: true,
    facebook: true,
    twitter: true,
    instagram: true,
  });
  const [isHandlingSave, setIsHandlingSave] = useState(false);
  const [isHandling, setIsHandling] = useState(false);
  const [preview, setPreview] = useState("");
  const [editModal, setEditModal] = useState(false);

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
  const [invalidImage, setInvalidImage] = useState(true);

  /**
   * check if all of the values of object is true
   * @param {object}​ meta - image/file info 
   * @return {boolean} if all values is true return true else false
   */
  const allTrue = (obj) => {
    for (var o in obj) if (!obj[o]) return true;
    return false;
  };

  useEffect(() => {
    loadData();
  }, []); /*eslint-disable-line*/

  // load current user information and permission
  const loadData = async () => {
    setIsHandling(true);
    const userInfo = await getUserById(currentUser.user_id);
    if (userInfo && isNotEmptyObject(userInfo)) {
      setUserData({
        ...userData,
        display_name: isNotEmptyString(userInfo.display_name)
          ? userInfo.display_name
          : currentUser.display_name,
      });
    }
    const userPermissions = await getRoleById(currentUser?.role_id);
    const permissionList = await getPermissionGroupList();
    const formatted = permissionList?.map((item) => {
      return {
        [item.plugin]: item.permissions.map((p) => p.code),
      };
    });
    console.log(formatted);
    console.log(formatPermissionData(userPermissions.permissions));
    // setPermissions(userPermissions.permissions)
    setIsHandling(false);
  };

  const formatPermissionData = (data) => {
    const key = data
      .map((permission) => permission.split(".")[0])
      .filter((item, i, ar) => ar.indexOf(item) === i);
    let o = {};
    key.forEach((key) => {
      o[key] = [];
    });
    data.forEach(
      (permission) =>
        (o[permission.split(".")[0]] = [
          ...o[permission.split(".")[0]],
          permission.split(".")[1],
        ])
    );
    return o;
  };

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

  // check if name field is not empty
  const handleNameBlur = () => {
    if (userData?.display_name === "") {
      setIsValid({
        ...isValid,
        display_name: false,
      });
    } else {
      setIsValid({
        ...isValid,
        display_name: true,
      });
    }
  };

  // check if description field has valid length
  // const handleDescriptionBlur = () => {
  //   if (userData?.description?.length >= 160) {
  //     setIsValid({
  //       ...isValid,
  //       description: false,
  //     });
  //   } else {
  //     setIsValid({
  //       ...isValid,
  //       description: true,
  //     });
  //   }
  // };

  /**
   * fields onblur handler
   * @param {string}​ type - input field name
   * @param {string}​ regex - pattern/validation
   * @param {string}​ stateValue - value to check
   * @return {boolean} true or false
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

  // save changes
  const handleSave = async () => {
    // const data = {
    //   user_id: currentUser.user_id,
    //   display_name: userData.display_name,
    // };
    setIsHandlingSave(true);
    const {
      description,
      facebook,
      twitter,
      instagram,
      position,
      image,
    } = userData;
    const payloadData = new FormData();
    payloadData.append(
      "description",
      isNotEmptyString(description) ? description : ""
    );
    payloadData.append("facebook", isNotEmptyString(facebook) ? facebook : "");
    payloadData.append("twitter", isNotEmptyString(twitter) ? twitter : "");
    payloadData.append(
      "instagram",
      isNotEmptyString(instagram) ? instagram : ""
    );
    payloadData.append("position", isNotEmptyString(position) ? position : "");
    payloadData.append("image", image);
    // for (var pair of payloadData.entries()) {
    //   console.log(pair[0]+ ', ' + pair[1]);
    // }
    try {
      // let res = await updateUserProfile(payloadData)
      // let resName = await updateUserById(data, currentUser.user_id)
      // if (resName.successful) {
      //   setIsHandlingSave(false)
      //   // window.location.href = '/articles'
      // } else {
      //   setIsHandlingSave(false)
      // }
    } catch (error) {
      setIsHandlingSave(false);
      alert(error);
    }
    setIsHandlingSave(false);
  };

  /**
   * fields onchange handler
   * @param {object}​ e - input onchange reference
   * @return {object} file/image info
   */
  const uploadImage = (e) => {
    const file = e.target.files[0];
    const size = file?.size;
    const convert = URL.createObjectURL(file);
    if (size && size < 1000000) {
      setInvalidImage(true);
      setPreview(convert);
      handleChange("image", file);
    } else {
      setInvalidImage(false);
    }
  };

  const handleChangePassword = async () => {
    if (
      isNotEmptyString(password) ||
      isNotEmptyString(newPassword) ||
      isNotEmptyString(confirmPassword)
    ) {
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
        setNewPasswordError(true);
        setInvalid(true);
      }
    } else {
      setInvalid(true);
    }
  };

  return (
    <React.Fragment>
      <NotifModal />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <CCard className="w-50 p-3 mt-5 mb-5">
          {isHandling ? (
            <CSpinner color="secondary" />
          ) : (
            <React.Fragment>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
                className="mb-3"
              >
                <h4 className="mb-4">Edit Profile</h4>
                <CButton
                  disabled={allTrue(isValid)}
                  className="w-25"
                  type="button"
                  color="success"
                  onClick={() => handleSave()}
                >
                  Save
                  {isHandlingSave && <CSpinner size="sm" color="secondary" />}
                </CButton>
              </div>
              <CCard
                className="_card-profile p-2"
                style={{ position: "relative", marginBottom: "50px" }}
              >
                <CRow className="mb-3">
                  <CCol md="4" className="mb-2">
                    <div className="position-relative">
                      <img
                        className="w-100"
                        src={
                          preview !== ""
                            ? preview
                            : userData.image && userData.image !== null
                            ? userData.image
                            : defaultImg
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
                        <CTooltip
                          advancedOptions={{
                            touch: false,
                          }}
                          content="Upload image"
                        >
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
                  <CCol md="8" className="mb-2">
                    <div className="py-4">
                      <p className="mb-0">
                        <small>User ID: {userData.user_id || ""}</small>
                      </p>
                      <h1 className="mb-0">
                        {currentUser && currentUser.display_name}
                      </h1>
                      <p className="mb-0">{currentUser && currentUser.email}</p>
                    </div>
                  </CCol>
                  <CCol sm="12">
                    {invalidImage ? (
                      ""
                    ) : (
                      <small className="help-block mb-0 text-danger">
                        &#9432; &nbsp; file size exceed to 1mb, Please choose
                        other image
                      </small>
                    )}
                    <CFormText className="help-block">
                      &#9432; &nbsp; Image should be 300x300px with a maximum
                      file size of 200kb
                    </CFormText>
                  </CCol>
                </CRow>

                <div className="w-50 mb-3">
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
                      &#9432; &nbsp; Position displays on the site author
                      profile
                    </CFormText>
                  </div>
                </div>

                <div className="area-permission mb-3">
                  <h5 className="mb-1">Active Permissions</h5>
                  {isNotEmptyArray(permissions) &&
                    permissions.map((item, index) => {
                      const permi = item.split(".");
                      return (
                        <div
                          className="active-permission d-flex mb-2"
                          key={index}
                        >
                          <div className="item">Quill</div>
                          <div className="item">{permi[0]}</div>
                          <div className="item">{permi[1]}</div>
                        </div>
                      );
                    })}
                  {/* <div className='active-permission d-flex mb-2'>
                    <div className='item'>Quill</div>
                    <div className='item'>Article</div>
                    <div className='item'>Full Access</div>  
                  </div>
                  <div className='active-permission d-flex mb-2'>
                    <div className='item'>Quill</div>
                    <div className='item'>Article</div>
                    <div className='item'>Full Access</div>  
                  </div> */}
                </div>

                <h5 className="mb-1">Display Name</h5>
                <div className="mb-2">
                  <CInput
                    className="w-100"
                    type="text"
                    value={userData.display_name || ""}
                    onChange={(e) =>
                      handleChange("display_name", e.target.value)
                    }
                    onBlur={handleNameBlur}
                  />
                  {isValid.display_name ? (
                    ""
                  ) : (
                    <small className="help-block text-danger mb-0">
                      This field is required.
                    </small>
                  )}
                  <CFormText className="help-block">
                    &#9432; &nbsp; Name display on the site
                  </CFormText>
                </div>
                <h5>Position</h5>
                <div className="mb-3">
                  <CInput
                    className="w-100"
                    type="text"
                    value={userData.position === null ? "" : userData.position}
                    onChange={(e) => handleChange("position", e.target.value)}
                  />
                  <CFormText className="help-block">
                    &#9432; &nbsp; Position displays on the site author profile
                  </CFormText>
                </div>
                <h5>Description</h5>
                <div className="mb-3">
                  <CTextarea
                    className="w-100"
                    type="text"
                    value={userData.description || ""}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                  />
                  <CFormText className="help-block">
                    &#9432; &nbsp; Provide a short description about yourself.
                    Maximum length of 160 characters.
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
                    placeholder="http://twitter.com/user"
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
              </CCard>
            </React.Fragment>
          )}
        </CCard>
      </div>
      <div className="edit-profile-container">
        <CModal
          size="lg"
          show={editModal}
          onClose={() => setEditModal(!editModal)}
          className="_modal-right edit-profile-modal"
          closeOnBackdrop={false}
        >
          <div style={{ backgroundColor: "#fff" }}>
            <CModalHeader className="p-1">
              <CBreadcrumb className="mb-0 border-0">
                <CBreadcrumbItem>
                  <span
                    className="link"
                    style={{ cursor: "pointer" }}
                    onClick={() => setEditModal(false)}
                  >
                    Edit Profile
                  </span>
                </CBreadcrumbItem>
                <CBreadcrumbItem active>Edit Password</CBreadcrumbItem>
              </CBreadcrumb>
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
                <h5 className="mb-1">Old Password</h5>
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
                    &#9432; &nbsp; Must be at least 8 characters with no spaces
                    and contain at least 1 number
                  </CFormText>
                  {invalid && newPasswordError && isNotEmptyString(password) && (
                    <CFormText
                      className="help-block"
                      style={{ color: "#e55353 !important" }}
                    >
                      &#9432; Please use a better password.
                    </CFormText>
                  )}
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
                        Passwords doesn't match
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
    </React.Fragment>
  );
};

export default Profile;
