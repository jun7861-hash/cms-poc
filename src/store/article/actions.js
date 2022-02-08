import {
  UPDATE_ARTICLE_FORM,
  UPDATE_ARTICLE_LIST,
  UPDATE_AUTHOR_LIST
} from './constants'

export const updateArticleForm = (data) => {
  return {
    type: UPDATE_ARTICLE_FORM,
    data: {
      articleForm: {
        data: data
      }
    }
  }
}

export const updateArticleList = (data) => {
  return {
    type: UPDATE_ARTICLE_LIST,
    data: {
      articleList: data
    }
  }
}

export const updateAuthorList = (data) => {
  return {
    type: UPDATE_AUTHOR_LIST,
    data: {
      authorList: data
    }
  }
}