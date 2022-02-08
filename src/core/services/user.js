import axios from 'axios'
import store from 'store'
import { isNotEmptyObject } from 'core/helpers'
import * as masterActions from 'store/master/actions'
import * as userActions from 'store/user/actions'
import { verifyToken, refreshToken, errorHandler } from 'core/services/token'
import { signOut } from './auth'
const user_url = process.env.REACT_APP_FUNCTION_URL_USER_MANAGEMENT

/**
 * API CALL FORMAT!!!
 * for every api call get userToken from local storage (authentication)
 * check if token is verified - sign out if not
 * try catch api call using axios
 * check if API call was successful:
 *    return or dispatch data to redux store
 * if API call was unsuccessful:
 * if token is expired prompt the session expired modal then redirect user to login page
 * else call [errorHandler]
 */

/**
 * returns logged in user info
 * METHOD: GET
 */
export const loginWithEmailAndPassword = async () => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  try {
    if (
      isNotEmptyObject(userToken) && 
      (userToken.userId || userToken.user_id)) {
      const userInfo = await axios.get(user_url + `/users/info/details`, {
        headers: {
          'Authorization': userToken.token
        }
      });
      if (userInfo.data.data) {
        store.dispatch(masterActions.updateUser(userInfo.data.data));
        localStorage.setItem('userInfo', JSON.stringify(userInfo.data.data))
        return userInfo.data.data
      } else {
        // signOut()
      }
      return userInfo.data.data
    } else {
      console.log("no user token")
    }
  } catch(error) {
    console.log(error)
  }
};

/**
 * returns user's data by ID
 * @param {number|string} userId - user id
 * METHOD: GET
 */
export const getUserById = async (userId) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const userInfo = await axios.get(user_url + `/users/${userId}`, {
        headers: {
          'Authorization': userToken.token
        }
      });
      if (userInfo.data.successful) {
        return userInfo.data.data
      } else {
        if (userInfo.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await getUserById(userId)
            return res
          }
        } else {
          errorHandler(userInfo)
        }
        return userInfo.data
      }
    } catch(error) {
      console.log(error)
    }
  } else {
    signOut()
  }
}

/**
 * returns user's profile
 * METHOD: GET
 */
export const getUserProfile = async () => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const userInfo = await axios.get(user_url + `/profile`, {
        headers: {
          'Authorization': userToken.token
        }
      });
      if (!userInfo.data.successful) {
        if (userInfo.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await getUserProfile()
            return res
          } 
        } else {
          errorHandler(userInfo)
        }
      }
      return userInfo.data.data
    } catch(error) {
      console.log(error)
    }
  } else {
    console.log('getUserProfile')
    // signOut()
  }
}

/**
 * update user's profile
 * @param {object} data - description,facebook,twitter,instagram,position,image,display_name,
 * METHOD: PUT
 */
export const updateUserProfile = async (data) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const userInfo = await axios.put(user_url + `/profile`,
      data, {
        headers: {
          'Authorization': userToken.token,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (userInfo.data.successful) {
        return userInfo.data
      } else {
        if (userInfo.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await updateUserProfile(data)
            return res
          } 
        } else {
          errorHandler(userInfo)
        }
      }
    } catch(error) {
      console.log(error)
    }
  } else {
    signOut()
  }
}

/**
 * update user's data by id
 * @param {object} data - status ("1" | "0")
 * @param {number} userId - user's id
 * METHOD: PUT
 */
export const updateUserById = async (data, userId) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const userInfo = await axios.put(user_url + `/users/${userId}`, 
      data,{
        headers: {
          'Authorization': userToken.token
        }
      });
      if (!userInfo.data.successful) {
        if (userInfo.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await updateUserById(data, userId)
            return res
          } 
        } else {
          errorHandler(userInfo)
        }
      }
      return userInfo.data
    } catch(error) {
      console.log(error)
    }
  } else {
    signOut()
  }
}

/**
 * update user's data by id
 * @param {object} filter - status ("1" | "0")
 * METHOD: PUT
 */
export const getAllUser = async (filter) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const userInfo = await axios.get(user_url + `/users${filter}`, {
        headers: {
          'Authorization': userToken.token
        }
      });
      if (userInfo.data.successful) {
        store.dispatch(userActions.updateUserList(userInfo.data.data));
        return userInfo.data
      } else {
        if (userInfo.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await getAllUser(filter)
            return res
          }
        } else {
          errorHandler(userInfo)
        }
      }
    } catch(error) {
      console.log(error)
    }
  } else {
    signOut()
  }
}

/**
 * delete specific user by id
 * @param {number|string} id
 * METHOD: DELETE
 */
export const deleteUser = async (id) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const result = await axios.delete(user_url + `/users/${id}`, {
        headers: {
          'Authorization': userToken.token
        }
      });
      await getAllUser()
      if (!result.data.successful) {
        if (result.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await deleteUser(id)
            return res
          } 
        } else {
          errorHandler(result)
        }
      }
      return result.data
    } catch (error) {
      return error
    }
  } else {
    signOut()
  }
}

/**
 * get all roles available in the CMS
 * @param {object} filter - limit, page
 * METHOD: GET
 */
export const getAllRoles = async (filter) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const roles = await axios.get(user_url + `/roles${filter}`, {
        headers: {
          'Authorization': userToken.token
        }
      });

      if (roles.data.successful) {
        store.dispatch(userActions.updateRoleList(roles.data.data));
        return roles.data
      } else {
        if (roles.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await getAllRoles(filter)
            return res
          }
        } else {
          errorHandler(roles)
        }
      }
    } catch(error) {
      console.log(error)
    }
  } else {
    signOut()
  }
}

/**
 * check role name if already exist
 * @param {string} filter - role name
 * METHOD: GET
 */
export const checkRoleByName = async (filter) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const roles = await axios.get(user_url + `/roles${filter}`, {
        headers: {
          'Authorization': userToken.token
        }
      });

      if (roles.data.successful) {
        return roles.data.data
      } else {
        if (roles.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await checkRoleByName(filter)
            return res
          }
        } else {
          errorHandler(roles)
        }
      }
    } catch(error) {
      console.log(error)
    }
  } else {
    signOut()
  }
}

/**
 * get role data by id
 * @param {number|string} roleId
 * METHOD: GET
 */
export const getRoleById = async (roleId) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const roleInfo = await axios.get(user_url + `/roles/${roleId}`, {
        headers: {
          'Authorization': userToken.token
        }
      });
      if (!roleInfo.data.successful) {
        if (roleInfo.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await getRoleById(roleId)
            return res
          }
        } else {
          errorHandler(roleInfo)
        }
      }
     return roleInfo.data.data
    } catch(error) {
      console.log(error)
    }
  } else {
    signOut()
  }
}

/**
 * create new role
 * @param {object} data - name(string), description(string), permissions(array)
 * METHOD: POST
 */
export const createNewRole = async (data) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)

  if (verified) {
    try {
      const resp = await axios.post(user_url + '/roles', 
      data,{
        headers: {
          'Authorization': userToken.token
        },
      });
      if (!resp.data.successful) {
        if (resp.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await createNewRole(data)
            return res
          } 
        } else {
          errorHandler(resp)
        }
      }
      return resp.data
    } catch (error) {
      return error
    }
  } else {
    signOut()
  }
};

/**
 * update existing role by id
 * @param {object} data - name(string), description(string), permissions(array)
 * @param {number|string} roleId
 * METHOD: POST
 */
export const updateRoleById = async (data, roleId) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const userInfo = await axios.put(user_url + `/roles/${roleId}`, 
      data,{
        headers: {
          'Authorization': userToken.token
        }
      });
      if (!userInfo.data.successful) {
        if (userInfo.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await updateRoleById(data, roleId)
            return res
          }
        } else {
          errorHandler(userInfo)
        }
      }
      return userInfo.data
    } catch(error) {
      console.log(error)
    }
  } else {
    signOut()
  }
}

/**
 * get all permission grouped by modules
 * @param {object} filter - limit, page
 * METHOD: GET
 */
export const getPermissionGroupList = async (filter) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const permissions = await axios.get(user_url + `/permissions/group/list${filter}`, {
        headers: {
          'Authorization': userToken.token
        }
      });
      if (permissions.data.successful) {
        store.dispatch(userActions.updatePermissionGroupList(permissions.data.data));
        return permissions.data
      } else {
        if (permissions.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await getPermissionGroupList(filter)
            return res
          }
        } else {
          errorHandler(permissions)
        }
      }
    } catch(error) {
      console.log(error)
    }
  } else {
    signOut()
  }
}

/**
 * get all permissions
 * METHOD: GET
 */
export const getAllPermissions = async () => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const permissions = await axios.get(user_url + `/permissions`, {
        headers: {
          'Authorization': userToken.token
        }
      });
      if (permissions.data.successful) {
        store.dispatch(userActions.updatePermissionList(permissions.data.data));
        return permissions.data.data
      } else {
        if (permissions.data.message.name === 'TokenExpiredError') { 
          const response = await refreshToken()
          if (response) {
            const res =  await  getAllPermissions()
            return res
          }
        } else {
          errorHandler(permissions)
        }
      }
    } catch(error) {
      console.log(error)
    }
  } else {
    signOut()
  }
}

/**
 * update permission by id
 * @param {object} data
 * @param {number|string} permisssionId
 * METHOD: GET
 */
export const updatePermissionById = async (data, permisssionId) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const userInfo = await axios.put(user_url + `/roles/${permisssionId}`, 
      data,{
        headers: {
          'Authorization': userToken.token
        }
      });
      if (!userInfo.data.successful) {
        if (userInfo.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await updatePermissionById(data, permisssionId)
            return res
          }
        } else {
          errorHandler(userInfo)
        }
      }
      return userInfo.data
    } catch(error) {
      console.log(error)
    }
  } else {
    signOut()
  }
}

/**
 * update permission status
 * @param {array} data
 * METHOD: POST
 */
export const updatePermissionStatus = async (data) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const userInfo = await axios.post(user_url + `/permissions/update-status`, 
      data,{
        headers: {
          'Authorization': userToken.token
        }
      });
      if (!userInfo.data.successful) {
        if (userInfo.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await updatePermissionStatus(data)
            return res
          }
        } else {
          errorHandler(userInfo)
        }
      }
      return userInfo.data
    } catch(error) {
      console.log(error)
    }
  } else {
    signOut()
  }
}

/**
 * create new user
 * @param {object} data - email, role_id, status, display_name, author_slug
 * METHOD: POST
 */
export const createNewUser = async (data) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const resp = await axios.post(user_url + '/users', 
      data,{
        headers: {
          'Authorization': userToken.token
        },
      });
      if (!resp.data.successful) {
        if (resp.data.message.name === 'TokenExpiredError') {   
          const response = await refreshToken()
          if (response) {
            const res =  await createNewUser(data)
            return res
          }
        } else {
          errorHandler(resp)
        }
      }
      return resp.data
    } catch (error) {
      return error
    }
  } else {
    signOut()
  }
};

/**
 * forgot password
 * @param {string} email
 * METHOD: POST
 */
export const forgotPassword = async (email) => {
  try {
    const resp = await axios.post(user_url + '/auth/forgot-password', {
      email: email
    });
    return resp.data
  } catch (error) {
    return error.response.data.message
  }
};

/**
 * change password (forgot password)
 * @param {object} data - (password, confirm_password, encrypted_key)
 * METHOD: POST
 */
export const changePassword = async (data) => {
  try {
    const resp = await axios.post(user_url + '/auth/change-password', {
      password: data.password,
      confirm_password: data.confirm_password,
      encrypted_key: data.encrypted_key,
    });
    return resp.data
  } catch (error) {
    return error
  }
};

/**
 * check if authentication code is valid
 * @param {string} code
 * METHOD: GET
 */
export const checkIsValidCode = async (code) => {
  try {
    const resp = await axios.get(user_url + `/auth/validate/${code}`);
    return resp.data
  } catch (error) {
    return error
  }
};

/**
 * change password (inside profile)
 * @param {object} data - (old_password, password, confirm_password)
 * METHOD: POST
 */
export const changeProfilePassword = async (data) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const resp = await axios.post(user_url + '/profile/update-password', {
        old_password: data.old_password,
        password: data.password,
        confirm_password: data.confirm_password
      },{
        headers: {
          'Authorization': userToken.token
        }
      });
      if (!resp.data.successful) {
        if (resp.data.message.name === 'TokenExpiredError') { 
          const response = await refreshToken()
          if (response) {
            const res =  await changeProfilePassword(data)
            return res
          }
        } else {
          errorHandler(resp)
        }
      }
      return resp.data
    } catch (error) {
      return error
    }
  } else {
    signOut()
  }
};

/**
 * return all active role for option field
 * METHOD: GET
 */
export const getRoleOps = async () => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const resp = await axios.get(user_url + '/roles/options/lists',
      {
        headers: {
          'Authorization': userToken.token
        },
      });
      if (!resp.data.successful) {
        if (resp.data.message.name === 'TokenExpiredError') {   
          const response = await refreshToken()
          if (response) {
            const res =  await getRoleOps()
            return res
          }
        } else {
          errorHandler(resp)
        }
      }
      return resp.data.data
    } catch (error) {
      return error
    }
  } else {
    signOut()
  }
};