/* eslint-disable */
export const noSpaceAtBeginning = /(^\s*)/gi;
export const fixDoubleSpacing = /[ ]{2,}/gi;
export const fixSpacing = /\n +/;
export const noSpaceAtBeginningAndLast = /(^\s*)|(\s*$)/gi;
export const emailFormat = /(?!.*\.{2}(?:(?=(\\?))\2.)*?\1)^([a-z\d]+)([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0](\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0]+)*|((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0]))*(([ \t]*\r\n)?[ \t]+)){1,64}@(?![a-z\d\-\u00A0]*[.]{1}[a-z\d\-\u00A0]*[.]{1}[a-z\d\-\u00A0]*[.]{1})(([[]*(([a-z\d\-\u00A0]|[a-z\d\u00A0][a-z\d\-.:_~\u00A0][a-z\d\-\u00A0])\ ){0,255})*([a-z\d\u00A0]{1,253}|[a-z\d\u00A0][a-z\d\-.:_~\u00A0]{1,253}[a-z\d\u00A0]\]*)|(?:[A-Z0-9.-]+\.[A-Z]{2,4}|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\]))$/i;
export const passwordValidation = /^(?=.*\d)[0-9a-zA-Z-._!"`'#%&,:;<>=@{}~\$\(\)\*\+\/\\\?\[\]\^\|]{8,}$/ig
export const facebookUsername = /^(?:(?:http|https):\/\/)?(?:www.)?(facebook.com|fb.me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-\.]*\/?)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?$/
export const instagramUsername = /^(?:(?:http|https):\/\/)?(?:www.)?(?:instagram.com|instagr.am)\/([A-Za-z0-9-_/.]+)$/im
export const twitterUsername = /^http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_=?]+)$/
export const numberOnly = /^[0-9]*$/
export const httpAndHttps = /^((http|https):\/\/)/;