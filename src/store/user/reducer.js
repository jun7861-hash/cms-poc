import {
  UPDATE_USER_FORM_MODAL,
  UPDATE_USER_LIST,
  UPDATE_ROLE_LIST,
  UPDATE_ROLE_FORM_MODAL,
  UPDATE_PERMISSION_LIST,
  UPDATE_PERMISSION_GROUP_LIST
} from './constants'
import { initialState } from './models'

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_USER_FORM_MODAL:
      return state = {
        ...state,
        userForm: {
          open: action.data.open,
          data: action.data.data
        }
			};
    case UPDATE_USER_LIST:
      return state = {
        ...state,
        userList: action.data.userList
			};
    case UPDATE_ROLE_LIST:
      return state = {
        ...state,
        roleList: action.data.roleList
			};
    case UPDATE_ROLE_FORM_MODAL:
      return state = {
        ...state,
        roleForm: {
          open: action.data.open,
          data: action.data.data
        }
			};
    case UPDATE_PERMISSION_LIST:
      return state = {
        ...state,
        permissionList: action.data.permissionList
			};
    case UPDATE_PERMISSION_GROUP_LIST:
      return state = {
        ...state,
        permissionGroupList: action.data.permissionGroupList
			};
    default:
      return state
  }
}
