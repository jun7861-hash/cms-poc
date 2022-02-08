import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  CButton,
  CCol,
  CContainer,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow,
  CImg,
  CSpinner,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { useHistory } from "react-router-dom";
import { isNotEmptyObject, isNotEmptyString } from "core/helpers";
import { getUserToken } from "core/services/token";
import { loginWithEmailAndPassword } from "core/services/user";
import EmailInput from "components/emailInput";
import logo from "assets/images/logo.jpg";
import * as masterActions from "store/master/actions";

const Login = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [valid, setValid] = useState(true);
  const [isHandling, setIsHandling] = useState(false);
  const [callBackErr, setCallBackErr] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    isNotEmptyString(password)
      ? setErrors({
          ...errors,
          password: "",
        })
      : setErrors({
          ...errors,
          password: "Password is required",
        });
  }, [password]); /* eslint-disable-line */

  /**
   * login validation
   * check if current user has token
   * check if current user has expired token
   * @param {object}​ e - button onclick reference
   * @return {boolean} check if valid credentials
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    setValid(true);
    setCallBackErr("");
    const isValid =
      isNotEmptyString(email) &&
      isNotEmptyString(password) &&
      errors.email === ""
        ? true
        : false;
    if (isValid) {
      setIsHandling(true);
      const token = await getUserToken(email, password);
      if (
        isNotEmptyObject(token) &&
        isNotEmptyString(token.token) &&
        token.userId
      ) {
        setCallBackErr("");
        setErrors({
          email: "",
          password: "",
        });
        localStorage.setItem("quill_type", "stand_alone");
        const userInfo = await loginWithEmailAndPassword();
        if (isNotEmptyObject(userInfo) && userInfo.user_id) {
          dispatch(masterActions.updateUser(userInfo));
          setIsHandling(false);
          history.push("/articles");
          let interval = 30000;
          localStorage.endTime = + new Date() + interval;
        } else {
          setCallBackErr(userInfo);
          setIsHandling(false);
        }
      } else {
        setIsHandling(false);
        if (token && token.message) {
          if (token.message) {
            setCallBackErr(token.message);
          } else {
            setCallBackErr(token);
          }
        } else if (token.errors) {
          setValid(false);
          setErrors({
            ...errors,
            email: token.errors.email[0],
          });
        } else {
          setCallBackErr(token);
        }
      }
    } else {
      setValid(false);
    }
  };

  useEffect(() => {
    emailRef?.current?.blur();
    emailRef?.current?.focus();
  }, [emailRef, email]);

  return (
    <div className="c-app c-default-layout flex-row align-items-center entry-container">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol lg="7" className="px-0" style={{ backgroundColor: "#fff" }}>
            <CRow className="flex-col-direction-sm mx-0">
              <CCol md="7" className="px-0">
                <div className="p-md-4">
                  <div className="p-md-4 p-4">
                    <h1>Log in</h1>
                    <form onSubmit={(e) => handleLogin(e)}>
                      <div className="mb-3 mt-4">
                        <CInputGroup>
                          <CInputGroupPrepend>
                            <CInputGroupText>
                              <CIcon name="cil-user" />
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <EmailInput
                            innerRef={emailRef}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            handleError={(err) =>
                              setErrors({
                                ...errors,
                                email: err,
                              })
                            }
                            isInvalid={!valid && errors.email !== ""}
                          />
                        </CInputGroup>
                        {!valid && (
                          <small className="text-danger">{errors.email}</small>
                        )}
                      </div>
                      <div className="mb-3">
                        <CInputGroup className="mb-2">
                          <CInputGroupPrepend>
                            <CInputGroupText>
                              <CIcon name="cil-lock-locked" />
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <CInput
                            innerRef={passwordRef}
                            type={passwordType}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={
                              !valid && errors.password !== ""
                                ? "border-danger"
                                : ""
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
                        </CInputGroup>
                        {!valid && (
                          <small className="text-danger">
                            {errors.password}
                          </small>
                        )}
                        {callBackErr !== "" && (
                          <small className="text-danger">{callBackErr}</small>
                        )}
                      </div>
                      <CRow>
                        <CCol md="12">
                          <CButton
                            color="info"
                            className="px-4 btn-login w-100"
                            type="submit"
                            disabled={isHandling}
                          >
                            Log in
                            {isHandling && (
                              <CSpinner
                                className="ml-2"
                                size="sm"
                                color="secondary"
                              />
                            )}
                          </CButton>
                        </CCol>
                        <CCol md="12" className="text-right">
                          <CButton
                            color="link"
                            className="px-0"
                            to="/forgot-password"
                          >
                            Forgot password?
                          </CButton>
                        </CCol>
                      </CRow>
                    </form>
                  </div>
                </div>
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
  );
};

export default Login;
