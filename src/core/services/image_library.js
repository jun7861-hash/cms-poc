import axios from "axios";
import store from "store";
import * as masterActions from "store/master/actions";
import { signOut } from "core/services/auth";
import { verifyToken, refreshToken, errorHandler } from "core/services/token";
import { isNotEmptyString } from "../helpers"

const image_url = process.env.REACT_APP_FUNCTION_URL_IMAGE_LIBRARY;

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
 * returns all images with filters
 * METHOD: GET
 */
export const getAllImage = async (limit, search) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const imageInfo = await axios.get(`${image_url}images?page=1&limit=${limit}${isNotEmptyString(search) ? `&search=${search}` : ""}`, {
        headers: {
          Authorization: userToken.token,
        },
      });
      store.dispatch(masterActions.updateImageList(imageInfo.data.data));
      if (imageInfo.data.successful) {
        return imageInfo.data.data;
      } else {
        if (imageInfo.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            getAllImage(limit, search)
          }
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
 * returns all images data filtered by image ID
 * @param {number|string} image_id
 * METHOD: GET
 */
export const getImageById = async (image_id) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const image = await axios.get(image_url + `images/${image_id}`, {
        headers: {
          Authorization: userToken.token,
        },
      });
      if (image.data.successful) {
        store.dispatch(masterActions.updateImageForm(image.data.data));
        return image.data.data;
      } else {
        if (image.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await getImageById(image_id);
            return res;
          }
        } else {
          errorHandler(image);
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
 * DELETE SPECIFIC IMAGE
 * @param {number|string} image_id
 * @param {number|string} limit (pagination)
 * METHOD: GET
 */
export const deleteImage = async (image_id, limit) => {
  const userToken = JSON.parse(localStorage.getItem('userToken'))
  const verified = verifyToken(userToken)
  if (verified) {
    try {
      const result = await axios.delete(`${image_url}images/${image_id}`, {
        headers: {
          Authorization: userToken.token,
        },
      });
      await getAllImage(limit)
      if (!result.data.successful) {
        if (result.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            deleteImage(image_id)
          } 
        }
      }
      return result.data;
    } catch (error) {
      return error;
    }
  } else {
    signOut();
  }
};

/**
 * ADD NEW IMAGE
 * @param {object} data
 * METHOD: GET
 */
export const addImage = async (data) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const response = await axios.post(`${image_url}images`, data, {
        headers: {
          Authorization: userToken.token,
          "Content-Type": "multipart/form-data",
        },
      });
      if (!response.data.successful) {
        if (response.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await addImage(data);
            return res;
          }
        } else {
          errorHandler(response);
        }
      }
      return response;
    } catch (error) {
      console.log(error);
      return error;
    }
  } else {
    signOut();
  }
};

/**
 * UPDATE SPECIFIC IMAGE DETAILS
 * @param {object} data
 * METHOD: PUT
 */
export const editImage = async ({
  image_id,
  photographer,
  illustrator,
  contributor_fee,
  tags,
  caption,
  alt_text,
  link_label,
  link,
}) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  const data = {
    image_id: image_id,
    photographer: photographer,
    illustrator: illustrator,
    contributor_fee: contributor_fee,
    tags: tags,
    caption: caption,
    alt_text: alt_text,
    link_label: link_label,
    link: link,
  };
  if (verified) {
    try {
      const response = await axios.put(`${image_url}images/${image_id}`, data, {
        headers: {
          Authorization: userToken.token,
        },
      });
      if (!response.data.successful) {
        if (response.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await editImage({
              image_id,
              photographer,
              illustrator,
              contributor_fee,
              tags,
              caption,
              alt_text,
              link_label,
              link,
            });
            return res;
          }
        } else {
          errorHandler(response);
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
