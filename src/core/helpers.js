import * as Moment from "moment";

/**
 * validation if string is not empty
 * @param {string} value
 * @returns {boolean}
 */
export const isNotEmptyString = (value) => {
  return typeof value === "string" && value !== "";
};
/**
 * validation if object is not empty
 * @param {object} obj
 * @returns {boolean}
 */
export const isNotEmptyObject = (obj) =>
  obj &&
  typeof obj === "object" &&
  Array.isArray(obj) === false &&
  Object.keys(obj).length > 0;
/**
 * validation if array is not empty
 * @param {array} arr
 * @returns {boolean}
 */
export const isNotEmptyArray = (arr) => Array.isArray(arr) && arr.length > 0;
export const createAction = (type, key) => (val) => ({ type, [key]: val });
export const updateKey = (key) => (state, action) => (state[key] = action[key]);
export const Prefix = (prefix) => (name) => `${prefix}/${name}`;

/**
 * parsing of date to specific formats
 * @param {date} date
 * @param {string} format
 * parseDate(Date.now(),'MM/DD/YYYY') => 03/10/2021
 * parseDate(Date.now(),'YYYY-MM-DD hh:mm:ss') => 2021-03-10 10:53:55
 * parseDate(Date.now(),'MMM DD,YYYY hh:mm a') => Mar 10,2021 10:53 am
 * parseDate(Date.now(),'YYYY-MM-DD hh:mm:ss') => 2021-03-10 10:53:55
 */
export const parseDate = (date, format) => {
  return Moment.parseZone(date).format(format);
};

/**
 * constructing query param
 * @param {objects} filters
 * @returns {string}
 */
export const constructQueryParam = (filters) => {
  let queryParam = "?";
  for (const [key, value] of Object.entries(filters)) {
    queryParam += `${key}=${encodeURIComponent(value)}&`;
  }
  return queryParam.slice(0, -1);
};

/**
 * validation if two array is equal
 * @param {array} a
 * @param {array} b
 * @returns {boolean}
 */
export const isEqualArray = (a, b) => {
  if (a.length !== b.length) return false;
  const uniqueValues = new Set([...a, ...b]);
  for (const v of uniqueValues) {
    const aCount = a.filter((e) => e === v).length;
    const bCount = b.filter((e) => e === v).length;
    if (aCount !== bCount) return false;
  }
  return true;
};

export const getExtension = (path) => {
  const basename = path.split(/[\\/]/).pop(),
    pos = basename.lastIndexOf(".");
  if (basename === "" || pos < 1) return "";
  return basename.slice(pos + 1).toLowerCase();
};

/**
 * validation if file is supported
 * @returns {boolean}
 */
export const isFileSupport = (supportFormatList, mineTypes, fileName) => {
  if (!mineTypes) {
    return false;
  }
  let supportFlag = false;
  const mineTypesList = mineTypes.split(",");

  const extension = fileName ? getExtension(fileName) : null;

  for (const mineType of mineTypesList) {
    if (
      supportFormatList.includes(mineType) &&
      (!extension || supportFormatList.includes(extension))
    ) {
      supportFlag = true;
      break;
    }
  }
  return supportFlag;
};

/**
 * formatting slug
 * reducing double spaces and excluding special-characters
 * separates space with "-"
 * @param {string} string
 * @returns {string}
 */
export const formatSlug = (string) => {
  let formatted = string
    .replaceAll(/[^a-zA-Z0-9]+/g, " ")
    .replace(/\s+/g, "-")
    .toLowerCase();
  if (formatted.charAt(0) === "-") {
    formatted = formatted.substring(1);
  }
  if (formatted.charAt(formatted.length - 1) === "-") {
    formatted = formatted.slice(0, -1);
  }
  return formatted;
};

/**
 * append slug on this condition
 * slug + lfrm if body.length >= 1000
 * slug + lfrm2 if body.length >= 2000
 * and so on
 * @param {​string}​ body - body content must be a string
 * @param {​string}​ slug - slug
 * @returns {​string}​ - slug + suffix
 */
export const appendLfrm = (wordCount) => {
  //generate the suffix
  const suffix =
    wordCount >= 1000
      ? `lfrm${wordCount >= 2000 ? Math.floor(wordCount / 1000) : ""}`
      : "";
  return suffix;
};

/**
 * parses string into html entities
 * @param {array} input
 */
export const htmlDecode = (input) => {
  const doc = new DOMParser().parseFromString(input, "text/html");
  return doc.documentElement.textContent;
};

/**
 * RETURNS CLEAN TEXT
 * @param {string} content
 * ommits contents inside <figure class="image credits"></figure> (image & image credits)
 * removes special characters
 * removes &nbsp;
 * @returns {string}
 */
export const getCleanText = (content) => {
  if (isNotEmptyString(content)) {
    const figure = /<figure class="image credits">(.|\n)*<\/figure>/gi;
    const cleanText = content?.replace(figure, "");
    const stripTags = cleanText
      ?.replace(/<[^>]+>/g, "")
      ?.replace("&nbsp;", "")
      ?.replace(/[ ]{2,}/gi, " ")
      .replace(/(^\s*)|(\s*$)/gi, "")
      ?.replace("/\r|/\n", "");
    return htmlDecode(stripTags);
  } else {
    return "";
  }
};

/**
 * Count words
 * @param {string} str
 * @returns {number}
 */
export const countWords = (str) => {
  const cleanText = getCleanText(str);
  return cleanText.trim().split(/\s+/).length;
};

/**
 * Remove save notif id from local storage
 * @param {number|string} id
 */
export const removeSaveNotifId = (id) => {
  const isSavedParam = JSON.parse(localStorage.getItem("saved_notif"));
  const removeSaveNotif = isSavedParam?.filter(
    (ids) => ids?.toString() !== id?.toString()
  );
  localStorage.setItem(
    "saved_notif",
    JSON.stringify(removeSaveNotif ? removeSaveNotif : [])
  );
};
