import axios from 'axios'
import store from 'store'
import { signOut } from 'core/services/auth'
import { isNotEmptyObject, isNotEmptyString } from 'core/helpers'
import * as masterActions from 'store/master/actions'
const user_url = process.env.REACT_APP_FUNCTION_URL_USER_MANAGEMENT

/**
 * handles user validation
 * @param {string} email
 * @param {password} email
 * METHOD: POST
 */
export const getUserToken = async (email, password) => {
  try {
    const resp = await axios.post(user_url + '/auth/signin', {
      email: email,
      password: password
    });
    if (resp.data.token && resp.data.userId) {
      localStorage.setItem('userToken', JSON.stringify(resp.data));
      return resp.data
    } else {
      return resp.data
    }
  } catch (error) {
    return error.response.data.message
  }
};

/**
 * verify user's token
 * @param {string} userToken
 */
export const verifyToken = (userToken) => {
  if (
      isNotEmptyObject(userToken) &&
      isNotEmptyString(userToken.token) &&
      isNotEmptyString(userToken.refreshToken)
    ) {
    return true
  } else {
    return false
  }
}

/**
 * handles refreshing the token once expired
 * METHOD: POST
 */
export const refreshToken = async () => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  try {
    const res = await axios.post(user_url + '/token', {
      user_id: userToken.userId
    }, {
      headers: {
        'Authorization': userToken.refreshToken,
      }
    });
    if(res.data.successful) {
      localStorage.setItem('userToken', JSON.stringify({
        userId: userToken.userId,
        token: res.data.token,
        refreshToken: userToken.refreshToken
      }));
      return true
    } else {
      store.dispatch(masterActions.updateNotificationModal({
        open: true,
        type: "error",
        headerText: "Session Expired",
        bodyText: "Your session has expired! Please login again.",
        closeText: "Login",
        callback: async (closeModal) => {
          closeModal();
          signOut();
        },
      }));
      return false
    }
  } catch (error) {
    console.log(error)
  }
}

/**
 * handles refreshing the token every time user enters the article form
 * METHOD: POST
 */
export const refreshTokenOnEnter = async () => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const payload = {
    req_new_refresh_token: true,
    user_id: userToken.userId,
  }
  try {
    const res = await axios.post(user_url + '/token',
    payload,{
      headers: {
        'Authorization': userToken.refreshToken,
      }
    });
    if(res.data.successful) {
      localStorage.setItem('userToken', JSON.stringify({
        userId: userToken.userId,
        token: res.data.token,
        refreshToken: userToken.refreshToken
      }));
    } else {
      store.dispatch(masterActions.updateNotificationModal({
        open: true,
        type: "error",
        headerText: "Session Expired",
        bodyText: "Your session has expired! Please login again.",
        closeText: "Login",
        callback: async (closeModal) => {
          closeModal();
          signOut();
        },
      }));
    }
  } catch (error) {
    console.log(error)
  }
}

/**
 * handles uam sign in
 * @param {number|string} user_id
 * @param {string} token
 * @param {string} platform
 * METHOD: POST
 */
export const uamSignIn = async (user_id, token, platform) => {
  try {
    const resp = await axios.post(user_url + '/auth/uam/signin', {
      user_id: user_id,
      token: token,
      platform: platform,
    });
    return resp.data
  } catch (error) {
    return error.response.data.message
  }
};

/**
 * handles api errors
 * prompt modal if disabled user detected
 * redirect user if detects token error (multiple session in different browsers)
 */
export const errorHandler = async (respData) => {
  if (respData.data.message.name === "DisabledUser") {
    store.dispatch(masterActions.updateNotificationModal({
      open: true,
      type: "error",
      headerText: "Disabled User",
      bodyText: "Your account has been disabled, you need to sign in with an authorized account",
      closeText: "Login",
      callback: async (closeModal) => {
        closeModal();
        signOut();
      },
    }));
  } else if (respData.data.message.name === "TokenError") {
    // store.dispatch(masterActions.updateNotificationModal({
    //   open: true,
    //   type: "error",
    //   headerText: "Token Error",
    //   bodyText: "Multiple Session detected.",
    //   closeText: "Login",
    //   callback: async (closeModal) => {
    //     closeModal();
    //     signOut();
    //   },
    // }));
    signOut();
  }
}
