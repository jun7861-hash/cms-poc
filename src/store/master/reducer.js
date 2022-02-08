import {
  UPDATE_SEO_SCORE_MODAL,
  UPDATE_SIDEBAR_TOGGLE,
  UPDATE_SYNDICATE_MODAL,
  UPDATE_PROFILE_MODAL,
  UPDATE_IMAGE_FORM,
  UPDATE_USER,
  UPDATE_IMAGE_LIST,
  UPDATE_NOTIFICATION_MODAL,
  UPDATE_NOTIFICATION_TOAST,
  UPDATE_HISTORY_LIST,
  UPDATE_IMAGE_MODAL,
  UPDATE_USER_PERMISSIONS,
  UPDATE_NOTIFICATION_SERVICE
} from './constants'
import { initialState } from './models'

export const masterReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_USER:
      return state = {
        ...state,
        currentUser: action.data
			};
    case UPDATE_SEO_SCORE_MODAL:
      return state = {
        ...state,
        SEOScoreModal: {
          open: action.data.open,
          data: action.data.data
        }
			};
    case UPDATE_SYNDICATE_MODAL:
      return state = {
        ...state,
        syndicateModal: {
          open: action.data.open,
          data: action.data.data
        }
			};
    case UPDATE_PROFILE_MODAL:
      return state = {
        ...state,
        profileModal: {
          open: action.data.open,
          data: action.data.data
        }
			};
    case UPDATE_SIDEBAR_TOGGLE:
      return state = {
        ...state,
        sidebar: action.data.open
      }
    case UPDATE_IMAGE_FORM:
      return state = {
        ...state,
        imageForm: action.data.imageForm
      };
    case UPDATE_IMAGE_LIST:
      return state = {
        ...state,
        imageList: action.data.imageList
			};
    case UPDATE_NOTIFICATION_MODAL:
      return state = {
        ...state,
        NotificationModal: action.data
			};
    case UPDATE_NOTIFICATION_TOAST:
      return state = {
        ...state,
        NotificationToast: action.data
      };
    case UPDATE_HISTORY_LIST:
      return state = {
        ...state,
        historyList: action.data.historyList
      };
    case UPDATE_IMAGE_MODAL:
      return state = {
        ...state,
        imageModal: {
          open: action.data.open,
          data: action.data.data
        }
      };
    case UPDATE_USER_PERMISSIONS:
      return state = {
        ...state,
        userPermissions: action.data
      };
    case UPDATE_NOTIFICATION_SERVICE:
      return state = {
        ...state,
        notificationService: action.data
      };
    default:
      return state
  }
}
