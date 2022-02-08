import {
  UPDATE_SECTIONS_LIST,
  UPDATE_SECTION_FORM,
  UPDATE_TAG_FORM,
  UPDATE_TAG_LIST,
  UPDATE_BREAD_CRUMBS
} from './constants'
import { initialState } from './models'

export const toolsReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SECTIONS_LIST:
      return state = {
        ...state,
        sectionsList: action.data
			};
    case UPDATE_SECTION_FORM:
      return state = {
        ...state,
        sectionForm: action.data
			};
    case UPDATE_TAG_FORM:
      return state = {
        ...state,
        tagForm: {
          data: action.data.data
        }
			};
    case UPDATE_TAG_LIST:
      return state = {
        ...state,
        tagList: action.data.tagList
			};
    case UPDATE_BREAD_CRUMBS:
      return state = {
        ...state,
        breadCrumbs: action.data
			};
    default:
      return state
  }
}
