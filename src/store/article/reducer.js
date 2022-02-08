import {
  UPDATE_ARTICLE_FORM,
  UPDATE_ARTICLE_LIST,
  UPDATE_AUTHOR_LIST
} from './constants'
import { initialState } from './models'

export const articleReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_ARTICLE_FORM:
      return state = {
        ...state,
        articleForm: {
          data: action.data.articleForm.data
        }
			};
    case UPDATE_ARTICLE_LIST:
      return state = {
        ...state,
        articleList: action.data.articleList
			};
    case UPDATE_AUTHOR_LIST:
      return state = {
        ...state,
        authorList: action.data.authorList
      };
    default:
      return state
  }
}
