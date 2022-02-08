import React, { useState, useEffect } from "react";
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CInput,
  CRow,
  CLabel,
  CSpinner,
} from "@coreui/react";
import { useDispatch } from "react-redux";
import { isNotEmptyString, isNotEmptyObject } from "core/helpers";
import { passwordValidation } from "core/regex";
import {
  changePassword,
  loginWithEmailAndPassword,
  checkIsValidCode,
} from "core/services/user";
import * as masterActions from "store/master/actions";
import NotifModal from "components/NotifModal";

const ChangePassword = ({ match }) => {
  const dispatch = useDispatch();
  const [password, setPassword] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [PasswordError, setPasswordError] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const [isValidCode, setIsValidCode] = useState(false);

  const encrypted_key = match.params.c;

  /**
   * change password handler
   * check if password is valid
   * @param {object}​ e - button onclick reference
   * @return {boolean} check if new and confirm password are match
   */
  const handleChangePass = async (e) => {
    e.preventDefault();
    if (isNotEmptyString(password) && isNotEmptyString(confirmPassword)) {
      setInvalid(false);
      if (password.match(passwordValidation)) {
        if (password === confirmPassword) {
          try {
            setLoading(true);
            const res = await changePassword({
              password: password,
              confirm_password: confirmPassword,
              encrypted_key: encrypted_key,
            });
            if (res.successful) {
              localStorage.setItem(
                "userToken",
                JSON.stringify({
                  userId: res.userId,
                  token: res.token,
                  refreshToken: res.refreshToken,
                })
              );
              localStorage.setItem("quill_type", "stand_alone");
              const userInfo = await loginWithEmailAndPassword();
              if (isNotEmptyObject(userInfo) && userInfo.user_id) {
                dispatch(masterActions.updateUser(userInfo));
              }
              dispatch(
                masterActions.updateNotificationModal({
                  open: true,
                  type: "success",
                  bodyText: "Your Password has been changed!",
                  callback: async (closeModal) => {
                    closeModal();
                    setLoading(false);
                    window.location.href = "/articles";
                  },
                })
              );
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
              setLoading(false);
            }
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
        setPasswordError(true);
        setInvalid(true);
      }
    } else {
      setInvalid(true);
    }
  };

  /**
   * check if link provided after resetting password is expired
   * check if password is valid
   * @param {string}​ encrypted_key - key/link for resetting password
   * @return {boolean} true: successfuly changed the password
   */
  const checkCode = async (encrypted_key) => {
    setIsLoadingPage(true);
    const res = await checkIsValidCode(encrypted_key);
    if (res.successful) {
      setIsValidCode(true);
    } else {
      window.location.href = "/";
    }
    setIsLoadingPage(false);
  };

  useEffect(() => {
    checkCode(encrypted_key);
    console.log(encrypted_key);
  }, []); /*eslint-disable-line*/

  return (
    <React.Fragment>
      {isLoadingPage ? (
        <CSpinner color="secondary" />
      ) : (
        <React.Fragment>
          {isValidCode && (
            <React.Fragment>
              <NotifModal />
              <div className="c-app c-default-layout flex-row align-items-center entry-container">
                <CContainer>
                  <CRow className="justify-content-center">
                    <CCol md="7">
                      <CCardGroup>
                        <CCard className="p-4">
                          <CCardBody>
                            <CForm onSubmit={(e) => handleChangePass(e)}>
                              <h1 className="mb-2">Change Password</h1>
                              <small>Please setup your new password.</small>
                              <div className="mt-3">
                                <div className="mb-3">
                                  <CLabel>
                                    New Password{" "}
                                    <span className="text-danger">*</span>
                                  </CLabel>
                                  <div className="position-relative">
                                    <CInput
                                      className={
                                        invalid &&
                                        (!isNotEmptyString(password) ||
                                          PasswordError)
                                          ? "pr-5 border border-danger"
                                          : "pr-5"
                                      }
                                      value={password}
                                      type={passwordType}
                                      placeholder="Enter New Password"
                                      onChange={(e) =>
                                        setPassword(e.target.value)
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
                                  {invalid &&
                                  PasswordError &&
                                  isNotEmptyString(password) ? (
                                    <small className="text-danger">
                                      Must be at least 8 characters with no
                                      spaces and contain at least 1 number.
                                    </small>
                                  ) : (
                                    <small>
                                      Must be at least 8 characters with no
                                      spaces and contain at least 1 number.
                                    </small>
                                  )}
                                  {invalid && !isNotEmptyString(password) && (
                                    <p className="text-danger small">
                                      This field is required.
                                    </p>
                                  )}
                                </div>
                                <CLabel>
                                  Confirm New Password{" "}
                                  <span className="text-danger">*</span>
                                </CLabel>
                                <div className="position-relative">
                                  <CInput
                                    value={confirmPassword}
                                    type={confirmPasswordType}
                                    className={
                                      invalid &&
                                      (!isNotEmptyString(confirmPassword) ||
                                        confirmPasswordError)
                                        ? "pr-5 border border-danger"
                                        : "pr-5"
                                    }
                                    placeholder="Confirm New Password"
                                    onChange={(e) =>
                                      setConfirmPassword(e.target.value)
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
                                {invalid &&
                                  !isNotEmptyString(confirmPassword) && (
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
                                <CButton
                                  color="info"
                                  className="w-100 btn btn-primary mt-3"
                                  type="submit"
                                  disabled={loading}
                                >
                                  Change Password
                                  {loading && (
                                    <CSpinner
                                      className="ml-2"
                                      size="sm"
                                      color="secondary"
                                    />
                                  )}
                                </CButton>
                              </div>
                            </CForm>
                          </CCardBody>
                        </CCard>
                      </CCardGroup>
                    </CCol>
                  </CRow>
                </CContainer>
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default ChangePassword;
