import {
  UPDATE_USER_FORM_MODAL,
  UPDATE_USER_LIST,
  UPDATE_ROLE_LIST,
  UPDATE_ROLE_FORM_MODAL,
  UPDATE_PERMISSION_LIST,
  UPDATE_PERMISSION_GROUP_LIST
} from './constants'

export const updateUserFormModal = (open, data) => {
  return {
    type: UPDATE_USER_FORM_MODAL,
    data: {
      open: open,
      data: data
    }
  }
}

export const updateUserList = (data) => {
  return {
    type: UPDATE_USER_LIST,
    data: {
      userList: data
    }
  }
}

export const updateRoleFormModal = (open, data) => {
  return {
    type: UPDATE_ROLE_FORM_MODAL,
    data: {
      open: open,
      data: data
    }
  }
}

export const updateRoleList = (data) => {
  return {
    type: UPDATE_ROLE_LIST,
    data: {
      roleList: data
    }
  }
}

export const updatePermissionList = (data) => {
  return {
    type: UPDATE_PERMISSION_LIST,
    data: {
      permissionList: data
    }
  }
}

export const updatePermissionGroupList = (data) => {
  return {
    type: UPDATE_PERMISSION_GROUP_LIST,
    data: {
      permissionGroupList: data
    }
  }
}