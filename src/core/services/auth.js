import store from 'store'
import * as actions from 'store/master/actions'

/**
 * validate if user is authenticated by checking the local storage's data
 * userInfo - user's info
 * userToken - user's validtion token
 * returns boolean
 */

export const isAuthenticated = () => {
  const userInfo = localStorage.getItem('userInfo');
  const userToken = localStorage.getItem('userToken');
  if (userInfo && userToken) {
    return true
  } else {
    return false
  }
}

/**
 * handles user's signing out
 * remove all local storage data
 * then redirects user to login page
 */
export const signOut = () => {
  const type = localStorage.getItem('quill_type');
  store.dispatch(actions.updateUser(null));
  localStorage.removeItem('userInfo');
  localStorage.removeItem('userToken');
  localStorage.removeItem('quill_type');

  if (type === 'uam') {
    window.location.href = 'http://staging.spotuam.summitmedia-digital.com/logout'
  } else if (type === 'stand_alone') {
    window.location.href = '/login'
  }
};
