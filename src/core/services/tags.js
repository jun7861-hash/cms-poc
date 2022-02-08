import axios from "axios";
import store from "store";
import { verifyToken, refreshToken, errorHandler } from "core/services/token";
import * as toolActions from "store/tools/actions";
import { signOut } from "./auth";

const tag_url = process.env.REACT_APP_FUNCTION_URL_TAGS;

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
 * returns all TAGS with filters & pagination
 * @param {object} filter - status, type, page, limit
 * METHOD: GET
 */
export const getAllTag = async (filter) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const tagInfo = await axios.get(tag_url + `/tags${filter}`, {
        headers: {
          Authorization: userToken.token,
        },
      });
      if (tagInfo.data.successful) {
        // store.dispatch(toolActions.updateTagList(tagInfo.data.data));
        return tagInfo.data;
      } else {
        if (tagInfo.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res =  await getAllTag(filter);
            return res
          }
        } else {
          errorHandler(tagInfo)
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    signOut();
  }
};

/**
 * returns all active tags
 * METHOD: GET
 */
export const getTagOps = async () => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const tagInfo = await axios.get(tag_url + `/tags/options/lists`, {
        headers: {
          Authorization: userToken.token,
        },
      });
      if (tagInfo.data.successful) {
        return tagInfo.data.data;
      } else {
        if (tagInfo.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res =  await getTagOps();
            return res
          }
        } else {
          errorHandler(tagInfo)
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    signOut();
  }
};

/**
 * create new tag
 * @param {object} - name, slug, type, status
 * METHOD: POST
 */
export const addTag = async ({ name, slug, type, status }) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  const data = {
    name: name,
    slug: slug,
    type: type,
    status: status,
  };
  if (verified) {
    try {
      const response = await axios.post(tag_url + `/tags`, data, {
        headers: {
          Authorization: userToken.token,
        },
      });
      if (!response.data.successful) {
        if (response.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res =  await addTag({ name, slug, type, status });
            return res
          }
        } else {
          errorHandler(response)
        }
      }
      return response;
    } catch (error) {
      console.log(error);
    }
  } else {
    signOut();
  }
};

/**
 * get tag data by id
 * @param {number|string} tag_id
 * METHOD: GET
 */
export const getTagById = async (tag_id) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const response = await axios.get(`${tag_url}/tags/${tag_id}`, {
        headers: {
          Authorization: userToken.token,
        },
      });
      store.dispatch(toolActions.updateTagForm(response.data.data));
      if (response.data.successful) {
        return response.data.data;
      } else {
        if (response.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res =  await getTagById(tag_id);
            return res
          }
        } else {
          errorHandler(response)
        }
        return response.data;
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    signOut();
  }
};

/**
 * update specific tag
 * @param {object} - tag_id, name, slug, type, status
 * METHOD: PUT
 */
export const editTag = async ({ tag_id, name, slug, type, status }) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  const data = {
    tag_id: tag_id,
    name: name,
    slug: slug,
    type: type,
    status: status,
  };
  if (verified) {
    try {
      const response = await axios.put(`${tag_url}/tags/${tag_id}`, data, {
        headers: {
          Authorization: userToken.token,
        },
      });
      if (!response.data.successful) {
        if (response.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res =  await editTag({ tag_id, name, slug, type, status });
            return res
          }
        } else {
          errorHandler(response)
        }
      }
      return response.data;
    } catch (error) {
      console.log(error);
    }
  } else {
    signOut();
  }
};

/**
 * check if slug exist
 * @param {string} slug
 * METHOD: GET
 */
export const checkSlug = async (slug) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const response = await axios.get(`${tag_url}/tags?slug=${slug}`, {
        headers: {
          Authorization: userToken.token,
        },
      });
      if (!response.data.successful) {
        if (response.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res =  await checkSlug(slug);
            return res
          }
        } else {
          errorHandler(response)
        }
      }
      return response.data;
    } catch (error) {
      console.log(error);
    }
  } else {
    signOut();
  }
};

/**
 * check if tag exist but disabled
 * @param {string} name
 * METHOD: GET
 */
export const checkIfTagsIsDisabled = async (name) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const response = await axios.post(`${tag_url}/tags/content/filter`, {
        name: name,
      },{
        headers: {
          Authorization: userToken.token,
        },
      });
      if (!response.data.successful) {
        if (response.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res =  await checkIfTagsIsDisabled(name);
            return res
          }
        } else {
          errorHandler(response)
        }
      }
      return response.data;
    } catch (error) {
      console.log(error);
    }
  } else {
    signOut();
  }
};