import React, { useState } from "react";
import {
  CButton,
  CForm,
  CCol,
  CContainer,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow,
  CImg,
  CSpinner,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { useDispatch } from "react-redux";
import * as EmailValidator from "email-validator";
import { forgotPassword } from "core/services/user";
import { isNotEmptyString } from "core/helpers";
import * as masterActions from "store/master/actions";
import EmailInput from "components/emailInput";
import NotifModal from "components/NotifModal";
import logo from "assets/images/logo.jpg";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [valid, setValid] = useState(true);
  const [loading, setLoading] = useState(false);

  /**
   * reset password handler
   * check if email is already registered
   * check if email is valid
   * @param {object}​ e - button onclick reference
   * @return {boolean} check email if is existing
   */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (isNotEmptyString(email)) {
      setValid(true);
      const isValid = EmailValidator.validate(email);
      if (isValid) {
        setError("");
        setLoading(true);
        try {
          let res;
          res = await forgotPassword(email);
          if (res.successful) {
            dispatch(
              masterActions.updateNotificationModal({
                open: true,
                type: "success",
                bodyText: res.message,
                headerText: "Email Sent",
                callback: async (closeModal) => {
                  closeModal();
                },
              })
            );
          } else {
            if (res.message) {
              setValid(false);
              setError(res.message);
            } else {
              setValid(false);
              setError(res);
            }
          }
        } catch (error) {
          setValid(false);
          setError(error);
        }
        setLoading(false);
      } else {
        setError("Please enter a valid email address");
        setValid(false);
      }
    } else {
      setError("This is a required field");
      setValid(false);
    }
  };

  return (
    <React.Fragment>
      <NotifModal />
      <div className="c-app c-default-layout flex-row align-items-center entry-container">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol lg="7" className="px-0" style={{ backgroundColor: "#fff" }}>
              <CRow className="flex-col-direction-sm mx-0">
                <CCol md="7" className="px-0">
                  <CForm
                    onSubmit={(e) => handleResetPassword(e)}
                    className="p-md-4"
                  >
                    <div className="p-md-4 p-4">
                      <h1 className="mb-4">Reset password</h1>
                      <div className="mb-3">
                        <CInputGroup>
                          <CInputGroupPrepend>
                            <CInputGroupText>
                              <CIcon name="cil-user" />
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <EmailInput
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            handleError={(err) => setError(err)}
                            invalid={!valid && isNotEmptyString(error)}
                          />
                        </CInputGroup>
                        {!valid && (
                          <small className="text-danger">{error}</small>
                        )}
                      </div>
                      <CButton
                        color="info"
                        className="w-100 btn btn-primary mb-4"
                        type="submit"
                        disabled={loading}
                      >
                        Reset password
                        {loading && (
                          <CSpinner
                            className="ml-2"
                            size="sm"
                            color="secondary"
                          />
                        )}
                      </CButton>
                      <p>
                        <CButton
                          color="link"
                          className="p-0"
                          style={{ verticalAlign: "baseline" }}
                          to="/login"
                        >
                          Back to Log in
                        </CButton>
                      </p>
                    </div>
                  </CForm>
                </CCol>
                <CCol
                  md="5"
                  className="logo-container d-flex align-items-center px-0"
                >
                  <div className="p-md-1 p-4">
                    <CImg src={logo} className="w-100" alt="logo" />
                  </div>
                </CCol>
              </CRow>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    </React.Fragment>
  );
};

export default ForgotPassword;
