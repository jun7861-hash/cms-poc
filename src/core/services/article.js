import axios from "axios";
import store from "store";
import * as articleActions from "store/article/actions";
import * as masterActions from "store/master/actions";
import { signOut } from "core/services/auth";
import { verifyToken, refreshToken, errorHandler } from "core/services/token";

/**
 * api's from ENV
 */
const articles_url = process.env.REACT_APP_FUNCTION_URL_ARTICLES;
const users_url = process.env.REACT_APP_FUNCTION_URL_USER_MANAGEMENT;
const version_url = process.env.REACT_APP_FUNCTION_URL_VERSION_HISTORY;

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
 * returns all article list without filters
 * METHOD: GET
 */

export const getArticleList = async () => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const articles = await axios.get(
        articles_url + `/articles?page=1&limit=100000`,
        {
          headers: {
            Authorization: userToken.token,
          },
        }
      );
      if (articles.data.successful) {
        store.dispatch(articleActions.updateArticleList(articles.data.data));
        return articles.data.data;
      } else {
        if (articles.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await getArticleList();
            return res;
          }
        } else {
          errorHandler(articles);
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
 * returns all article data by id
 * @param {number|string} article_id - article id
 * METHOD: GET
 */
export const getArticleById = async (article_id) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const articles = await axios.get(
        articles_url + `/articles/${article_id}`,
        {
          headers: {
            Authorization: userToken.token,
          },
        }
      );
      if (articles.data.successful) {
        return articles.data;
      } else {
        if (articles.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await getArticleById(article_id);
            return res;
          }
        } else {
          errorHandler(articles);
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
 * returns all active user inside the CMS
 * METHOD: GET
 */
export const getAllUserByAuthors = async () => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const roles = await axios.get(users_url + `/users/role/all`, {
        headers: {
          Authorization: userToken.token,
        },
      });
      if (roles.data.successful) {
        store.dispatch(articleActions.updateAuthorList(roles.data.data));
        return roles.data.data;
      } else {
        if (roles.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await getAllUserByAuthors();
            return res;
          }
        } else {
          errorHandler(roles);
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
 * CREATE NEW ARTICLE
 * @param {object} data - article data
 * METHOD: POST
 */
export const addArticle = async (data) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const response = await axios.post(`${articles_url}/articles`, data, {
        headers: {
          Authorization: userToken.token,
        },
      });
      if (!response.data.successful) {
        if (response.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await addArticle(data);
            return res;
          }
        } else {
          errorHandler(response);
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
 * CREATE NEW USER
 * @param {object} data - user data
 * METHOD: POST
 */
export const createNewUser = async (data) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const resp = await axios.post(articles_url + "/users", data, {
        headers: {
          Authorization: userToken.token,
        },
      });
      if (!resp.data.successful) {
        if (resp.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await createNewUser(data);
            return res;
          }
        } else {
          errorHandler(resp);
        }
      }
      return resp.data;
    } catch (error) {
      console.log(error);
    }
  } else {
    signOut();
  }
};

/**
 * UPDATE EXISTING ARTICLE
 * @param {object} data - article data
 * @param {number|string} article_id - article id
 * METHOD: PUT
 */
export const editArticle = async (data, article_id) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const response = await axios.put(
        `${articles_url}articles/${article_id}`,
        data,
        {
          headers: {
            Authorization: userToken.token,
          },
        }
      );
      if (!response.data.successful) {
        if (response.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await editArticle(data, article_id);
            return res;
          }
        } else {
          errorHandler(response);
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
 * GET ARTICLE HISTORY BY ID
 * @param {number|string} article_id - article id
 * METHOD: GET
 */
export const getArticleHistoryById = async (article_id) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const articles = await axios.get(
        articles_url + `/articles/${article_id}/article-history`,
        {
          headers: {
            Authorization: userToken.token,
          },
        }
      );
      if (articles.data.successful) {
        store.dispatch(masterActions.updateHistoryList(articles.data.data));
        return articles.data.data;
      } else {
        if (articles.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await getArticleHistoryById(article_id);
            return res;
          }
        } else {
          errorHandler(articles);
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
 * GET VERSION HISTORY BY ID
 * @param {number|string} article_id - article id
 * METHOD: GET
 */
export const getVersionHistoryById = async (article_id) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const articles = await axios.get(
        version_url + `/articles/${article_id}/version-history`,
        {
          headers: {
            Authorization: userToken.token,
          },
        }
      );
      if (articles.data.successful) {
        return articles.data.data;
      } else {
        if (articles.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await getVersionHistoryById(article_id);
            return res;
          }
        } else {
          errorHandler(articles);
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
 * CHECK ARTICLE TITLE IF EXIST
 * @param {string} title - article TITLE
 * METHOD: GET
 */
export const checkTitle = async (title) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const articles = await axios.get(
        articles_url + `/articles?title=${title}`,
        {
          headers: {
            Authorization: userToken.token,
          },
        }
      );
      if (articles.data.successful) {
        return articles.data.data;
      } else {
        if (articles.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await checkTitle(title);
            return res;
          }
        } else {
          errorHandler(articles);
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
 * SET ARTICLE TO DRAFT
 * @param {array} data - contains section id's of articles to be set to draft
 * METHOD: POST
 */
export const setToDraft = async (data) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const section = await axios.post(
        articles_url + `/articles/set-to-draft`,
        data,
        {
          headers: {
            Authorization: userToken.token,
          },
        }
      );
      if (section.data.successful) {
        return section.data;
      } else {
        if (section.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await setToDraft(data);
            return res;
          }
        } else {
          errorHandler(section);
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
 * SET ARTICLE TO UNCATEGORIZED
 * @param {array} data - contains section id's of articles to be set to uncategorized
 * METHOD: POST
 */
export const setToUncategorized = async (data) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const section = await axios.post(
        articles_url + `/articles/uncategorized`,
        data,
        {
          headers: {
            Authorization: userToken.token,
          },
        }
      );
      if (section.data.successful) {
        return section.data;
      } else {
        if (section.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await setToUncategorized(data);
            return res;
          }
        } else {
          errorHandler(section);
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
 * RECHANNEL ARTICLES
 * @param {array} data - section_id, section_name, section_url, articles
 * METHOD: POST
 */
export const reChannelArticles = async (data) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const section = await axios.post(
        articles_url + `articles/rechannel`,
        data,
        {
          headers: {
            Authorization: userToken.token,
          },
        }
      );
      if (section.data.successful) {
        return section.data;
      } else {
        if (section.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await reChannelArticles(data);
            return res;
          }
        } else {
          errorHandler(section);
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
 * FILTER ARTICLES
 * @param {array} data - status, authors, tags, section_ids, date_from, date_to, sort, page, limit, sort
 * METHOD: POST
 */
export const filterArticles = async (data) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const section = await axios.post(
        articles_url + `/articles/content/filter`,
        data,
        {
          headers: {
            Authorization: userToken.token,
          },
        }
      );
      if (section.data.successful) {
        return section.data;
      } else {
        if (section.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await filterArticles(data);
            return res;
          }
        } else {
          errorHandler(section);
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
 * FILTER ARTICLES BY SECTION
 * @param {object} data - limit, page, section_id(array)
 * METHOD: POST
 */

export const getArticlesBySection = async (data) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const section = await axios.post(
        articles_url + `articles/sections/bulk`,
        data,
        {
          headers: {
            Authorization: userToken.token,
          },
        }
      );
      if (section.data.successful) {
        return section.data;
      } else {
        if (section.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await getArticlesBySection(data);
            return res;
          }
        } else {
          errorHandler(section);
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
 * GET TAGS COUNT
 * @param {object} data - tags(object)
 * METHOD: POST
 */
export const postTagOptionsCount = async (data) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  const sampleData = {
    tags: data,
  };
  if (verified) {
    try {
      const tagInfo = await axios.post(
        articles_url + `/articles/tags/count`,
        sampleData,
        {
          headers: {
            Authorization: userToken.token,
          },
        }
      );
      if (tagInfo.data.successful) {
        return tagInfo.data.data;
      } else {
        if (tagInfo.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await postTagOptionsCount(data);
            return res;
          }
        } else {
          errorHandler(tagInfo);
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
 * LOCK / UNLOCK ARTICLE
 * @param {object} data - id, type("lock|unlock"), data(locked_by, autosave, locked_by_name)
 * METHOD: PUT
 */
export const lockUnlockArticle = async (id, type, data) => {
  const userToken = JSON.parse(localStorage.getItem("userToken"));
  const verified = verifyToken(userToken);
  if (verified) {
    try {
      const articles = await axios.put(
        articles_url + `articles/${id}/state/${type}`,
        data,
        {
          headers: {
            Authorization: userToken.token,
          },
        }
      );
      if (articles.data.successful) {
        return articles.data;
      } else {
        if (articles.data.message.name === "TokenExpiredError") {
          const response = await refreshToken();
          if (response) {
            const res = await lockUnlockArticle(id, type, data);
            return res;
          }
        } else {
          errorHandler(articles);
        }
      }
    } catch (error) {
      console.log(error);
    }
  } else {
    signOut();
  }
};
