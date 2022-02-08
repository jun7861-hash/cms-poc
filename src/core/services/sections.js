import axios from 'axios'
import store from 'store'
import * as toolsActions from 'store/tools/actions'
import { signOut } from 'core/services/auth'
import { verifyToken, refreshToken, errorHandler } from 'core/services/token'
const section_url = process.env.REACT_APP_FUNCTION_URL_SECTIONS

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
 * returns all SECTIONS with filters & pagination
 * @param {object} filter - status, page, limit
 * METHOD: GET
 */
export const getSectionsList = async (filter) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const userInfo = await axios.get(section_url + `sections${filter}`, {
        headers: {
          'Authorization': userToken.token
        }
      });
      if (userInfo.data.successful) {
        store.dispatch(toolsActions.updateSectionsList(userInfo.data.data));
        return userInfo.data
      } else {
        if (userInfo.data.message.name === 'TokenExpiredError') {  
          const response = await refreshToken()
          if (response) {
            const res =  await getSectionsList(filter)
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
 * check if section name exist
 * @param {string} name
 * @param {string} id
 * METHOD: GET
 */
export const validateSectionName = async (name, id) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const userInfo = await axios.get(section_url + `/sections/check/value?section=${name}&parent_id=${id}`, {
        headers: {
          'Authorization': userToken.token
        }
      });
      if (userInfo.data.successful) {
        store.dispatch(toolsActions.updateSectionsList(userInfo.data.data));
        return userInfo.data
      } else {
        if (userInfo.data.message.name === 'TokenExpiredError') {  
          const response = await refreshToken()
          if (response) {
            const res =  await validateSectionName(name, id)
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
 * returns all active sections
 * METHOD: GET
 */
export const getSectionOps = async () => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const userInfo = await axios.get(section_url + `sections/options/lists?type=1`, {
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
            const res =  await getSectionOps()
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
 * returns all active sections grouped by parent sections
 * METHOD: GET
 */
export const getParentsGrouped = async () => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const userInfo = await axios.get(section_url + `sections/options/lists?type=2`, {
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
            const res =  await getParentsGrouped()
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
 * returns all active parent sections
 * METHOD: GET
 */
export const getParentSections = async () => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const userInfo = await axios.get(section_url + `sections?type=parent`, {
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
            const res =  await getParentSections()
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
 * returns section data by id
 * @param {number|string} id - section id
 * METHOD: GET
 */
export const getSectionsById = async (id) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const section = await axios.get(section_url + `sections/${id}`, {
        headers: {
          'Authorization': userToken.token
        }
      });
      if (section.data.successful) {
        return section.data.data
      } else {
        if (section.data.message.name === 'TokenExpiredError') { 
          const response = await refreshToken()
          if (response) {
            const res =  await getSectionsById(id)
            return res
          }
        } else {
          errorHandler(section)
        }
      }
    } catch(error) {
      console.log(error)
    }
  } else {

  }
}

/**
 * check if section is active
 * @param {number|string} id - section id
 * METHOD: GET
 */
export const checkIfSectionIsActive = async (id) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const section = await axios.get(section_url + `sections/${id}/content`, {
        headers: {
          'Authorization': userToken.token
        }
      });
      if (section.data.successful) {
        return section.data.data
      } else {
        if (section.data.message.name === 'TokenExpiredError') { 
          const response = await refreshToken()
          if (response) {
            const res =  await checkIfSectionIsActive(id)
            return res
          }
        } else {
          errorHandler(section)
        }
      }
    } catch(error) {
      console.log(error)
    }
  } else {

  }
}

/**
 * create new section
 * @param {object} data - section, description, parent_id, slug, status, url
 * METHOD: POST
 */
export const createSection = async (data) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const section = await axios.post(section_url + `sections`, 
      data,{
        headers: {
          'Authorization': userToken.token
        }
      });
      if (section.data.successful) {
        return section.data
      } else {
        if (section.data.message.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await createSection(data)
            return res
          } 
        } else {
          errorHandler(section)
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
 * update existing section
 * @param {object} data - section, description, parent_id, slug, status, url
 * @param {number|string} id - section id
 * METHOD: PUT
 */
export const updateSection = async (data, id) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const section = await axios.put(section_url + `sections/${id}`, 
      data,{
        headers: {
          'Authorization': userToken.token
        }
      });
      if (section.data.successful) {
        return section.data
      } else {
        if (section?.data?.message?.name === 'TokenExpiredError') {
          const response = await refreshToken()
          if (response) {
            const res =  await updateSection(data, id)
            return res
          }
        } else {
          errorHandler(section)
        }
      }
    } catch(error) {
      console.log(error)
    }
  } else {
    signOut()
  }
}

