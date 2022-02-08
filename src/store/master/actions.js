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

export const updateUser = (data) => {
  return {
    type: UPDATE_USER,
    data: data
  }
}

export const updateSEOScoreModal = (open, data) => {
  return {
    type: UPDATE_SEO_SCORE_MODAL,
    data: {
      open: open,
      data: data
    }
  }
}

export const updateSyndicateModal = (open, data) => {
  return {
    type: UPDATE_SYNDICATE_MODAL,
    data: {
      open: open,
      data: data
    }
  }
}

export const updateProfileModal = (open, data) => {
  return {
    type: UPDATE_PROFILE_MODAL,
    data: {
      open: open,
      data: data
    }
  }
}

export const toggleSidebar = (open) => {
  return {
    type: UPDATE_SIDEBAR_TOGGLE,
    data: {
      open: open
    }
  }
}

export const updateImageForm = (data) => {
  return {
    type: UPDATE_IMAGE_FORM,
    data: {
      imageForm: data
    }
  }
}

export const updateImageList = (data) => {
  return {
    type: UPDATE_IMAGE_LIST,
    data: {
      imageList: data
    }
  }
}

export const updateNotificationModal = (data) => {
  return {
    type: UPDATE_NOTIFICATION_MODAL,
    data: data
  }
}

export const updateNotificationToast = (data) => {
  return {
    type: UPDATE_NOTIFICATION_TOAST,
    data: data
  }
}

export const updateHistoryList = (data) => {
  return {
    type: UPDATE_HISTORY_LIST,
    data: {
      historyList: data
    }
  }
}

export const updateImageModal = (data) => {
  return {
    type: UPDATE_IMAGE_MODAL,
    data: data
  }
}

export const updateUserPermission = (data) => {
  return {
    type: UPDATE_USER_PERMISSIONS,
    data: data
  }
}

export const updateNotificationService = (data) => {
  return {
    type: UPDATE_NOTIFICATION_SERVICE,
    data: data
  }
}