import {
  UPDATE_SECTION_FORM,
  UPDATE_TAG_FORM,
  UPDATE_TAG_LIST,
  UPDATE_SECTIONS_LIST,
  UPDATE_BREAD_CRUMBS
} from './constants'

export const updateSectionForm = (data) => {
  return {
    type: UPDATE_SECTION_FORM,
    data: data
  }
}

export const updateTagForm = (data) => {
  return {
    type: UPDATE_TAG_FORM,
    data: {
      data: data
    }
  }
}

export const updateTagList = (data) => {
  return {
    type: UPDATE_TAG_LIST,
    data: {
      tagList: data
    }
  }
}
  
export const updateSectionsList = (data) => {
  return {
    type: UPDATE_SECTIONS_LIST,
    data: data
  }
}

export const updateBreadCrumbs = (data) => {
  return {
    type: UPDATE_BREAD_CRUMBS,
    data: data
  }
}