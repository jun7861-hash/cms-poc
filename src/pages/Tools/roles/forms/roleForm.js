import React, { useState, useEffect } from "react";
import {
  CLabel,
  CInput,
  CRow,
  CCol,
  CCardBody,
  CCard,
  CCardHeader,
  CButton,
  CInputCheckbox,
  CFormGroup,
  CSpinner,
} from "@coreui/react";
import Modal from "components/Modal";
import { useDispatch, useSelector } from "react-redux";
import {
  isNotEmptyArray,
  isNotEmptyString,
  isNotEmptyObject,
} from "core/helpers";
import {
  createNewRole,
  getRoleById,
  updateRoleById,
  getPermissionGroupList,
  checkRoleByName,
} from "core/services/user";
import * as masterActions from "store/master/actions";
import * as actionTools from "store/tools/actions";

const RoleForm = ({ match }) => {
  const isEdit = match.params.id;
  const userPermissions = useSelector((state) => state.master.userPermissions);
  const breadCrumbs = useSelector((state) => state.tools.breadCrumbs);
  const isAllowedToEdit = userPermissions.includes("Role.Edit");
  const dispatch = useDispatch();
  const [data, setData] = useState({
    name: "",
    description: "",
    permissions: [],
  });
  const [permissionGroup, setPermissionGroup] = useState([]);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isHandlingSave, setIsHandlingSave] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roleNameExist, setRoleNameExist] = useState(false);

  /**
   * fetch all permissions available in the CMS
   */
  const loadPermissions = async () => {
    setIsLoading(true);
    const getPermissionsGroupList = await getPermissionGroupList("");
    if (getPermissionsGroupList.data) {
      setPermissionGroup(getPermissionsGroupList.data);
      match.params.id && loadData(match.params.id);
    }
    setIsLoading(false);
  };

  /**
   * get role by id
   */
  const loadData = async () => {
    setIsLoading(true);
    const roleDataById = await getRoleById(match.params.id);
    if (roleDataById && isNotEmptyObject(roleDataById)) {
      const newPermission = roleDataById.permissions;
      roleDataById.permissions = newPermission;
      dispatch(actionTools?.updateBreadCrumbs({
        ...breadCrumbs,
        role: roleDataById.name
      }))
      setData(roleDataById);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadPermissions();
    dispatch(actionTools?.updateBreadCrumbs({
      ...breadCrumbs,
      role: ""
    }))
  }, []); /* eslint-disable-line */

  /**
   * convert permission text to code
   * @param {string} code
   * e.g. Article.Create
   * 
   */
  const convertPermissionCode = (code) => {
    const mergeAll = permissionGroup
      .map((item) => item.permissions)
      .flat()
      .filter((item) => item.code === code)[0].permission_id;
    return mergeAll;
  };

  /**
   * handles updating role state
   * @param {string} type
   * - key of the objective state
   * @param {string} value
   * - value of the objective state
   */
  const handleOnChange = (type, value) => {
    setData({
      ...data,
      [type]: value,
    });
  };

  /**
   * handles permission checkbox tick
   * @param {string} value - value of the selected permission
   */
  const handleCheck = (value) => {
    const { permissions } = data;
    if (permissions.includes(value)) {
      if (value === "Article.Edit") {
        const _newData = permissions.filter(
          (item) =>
            item !== "Article.Change_Slug" &&
            item !== "Article.Change_Section" &&
            item !== value
        );
        setData({
          ...data,
          permissions: _newData,
        });
      } else {
        setData({
          ...data,
          permissions: permissions.filter((item) => item !== value),
        });
      }
    } else {
      setData({
        ...data,
        permissions: [...permissions, value],
      });
    }
  };

  /**
   * validation id role name already exisit
   */
  const isRoleNameExist = async () => {
    //api call
    const res = await checkRoleByName(`?name=${encodeURIComponent(data?.name)}`);
    if (res?.length > 0) {
      if (
        match.params.id &&
        res[0]?.role_id?.toString() === match.params.id?.toString()
      ) {
        setRoleNameExist(false);
        return false;
      } else {
        setRoleNameExist(true);
        return true;
      }
    } else {
      setRoleNameExist(false);
      return false;
    }
  };

  /**
   * check if all required fields is filled
   */
  const isValidated = async () => {
    setIsHandlingSave(true);
    const { name, permissions } = data;
    const isValidated = isNotEmptyString(name) && isNotEmptyArray(permissions);
    if (isValidated) {
      const nameExist = await isRoleNameExist();
      if (nameExist) {
        setShowError(true);
      } else {
        setShowError(false);
        setConfirmationModal(!confirmationModal);
      }
    } else {
      setShowError(true);
    }
    setIsHandlingSave(false);
  };

  /**
   * handles creating / updating a role
   */
  const handleSave = async () => {
    const { name, description, permissions } = data;
    setIsHandlingSave(true);
    try {
      let res;
      if (match.params.id) {
        const data = {
          name: name,
          description: description,
          permissions: permissions.map((item) => convertPermissionCode(item)),
        };
        res = await updateRoleById(data, match.params.id);
      } else {
        res = await createNewRole({
          name: name,
          description: description,
          permissions: permissions.map((item) => convertPermissionCode(item)),
        });
      }
      if (res.successful) {
        dispatch(
          masterActions.updateNotificationModal({
            open: true,
            type: "success",
            bodyText: res.message,
            callback: async (closeModal) => {
              closeModal();
              if (!match.params.id) {
                window.location.href = `/tools/role-form/${res.data.id}`;
              } else {
                loadData(match.params.id)
              }
            },
          })
        );
      } else {
        dispatch(
          masterActions.updateNotificationModal({
            open: true,
            type: "error",
            bodyText: res.message,
          })
        );
      }
    } catch (error) {
      dispatch(
        masterActions.updateNotificationModal({
          open: true,
          type: "error",
          bodyText: error,
        })
      );
    }
    setConfirmationModal(!confirmationModal);
    setIsHandlingSave(false);
  };

  /**
   * validation if all permission under specific module is all selected so the check all state will true
   * @param {array} _data
   */
  const isCheckedAll = (_data) => {
    const permission = _data.filter((p) => data.permissions.includes(p.code));
    return _data.length === permission.length ? true : false;
  };

  /**
   * handles checking all permissions under specific module
   * @param {array} permi
   */
  const handleCheckAll = (permi) => {
    const { permissions } = data;
    let includes = [];
    const _getAllCodes = permi.map((p) => p.code);
    _getAllCodes.forEach((item) => {
      if (permissions.includes(item)) {
        includes.push(item);
      }
    });
    const newArr = permissions.filter((e) => !includes.includes(e));
    if (isCheckedAll(permi)) {
      let newPermission = permissions.filter(
        (permission) => !_getAllCodes.includes(permission)
      );
      setData({
        ...data,
        permissions: newPermission,
      });
    } else {
      setData({
        ...data,
        permissions: newArr.concat(_getAllCodes),
      });
    }
  };

  
  /**
   * rendering all permissions grouped by modules
   * @param {array} _data
   */
  const renderPermissions = (_data) => {
    let render;
    if (_data) {
      render = _data.map((permission, index) => (
        <CCol lg="3" className="mb-4 mx-2" key={index}>
          <CFormGroup variant="custom-checkbox" inline className="mb-2">
            <CInputCheckbox
              custom
              id={`check-all-${permission.plugin}`}
              onChange={() => handleCheckAll(permission.permissions)}
              checked={isCheckedAll(permission.permissions)}
              disabled={isEdit && !isAllowedToEdit}
            />
            <CLabel
              variant="custom-checkbox"
              htmlFor={`check-all-${permission.plugin}`}
            >
              {permission.plugin}
            </CLabel>
          </CFormGroup>
          {permission.permissions.map((item, colIndex) => (
            <CCol lg="12" key={colIndex}>
              <CFormGroup variant="custom-checkbox" inline>
                <CInputCheckbox
                  id={item.code}
                  custom
                  value={item.code}
                  onChange={() => handleCheck(item.code)}
                  checked={data.permissions.includes(item.code) && item.status === 1}
                  disabled={
                    isEdit && !isAllowedToEdit ? true :
                    (item.status === 0) ||
                    ((item.code === "Article.Change_Slug" ||
                      item.code === "Article.Change_Section") &&
                      item.status === 1 &&
                    !data.permissions.includes("Article.Edit"))
                  }
                />
                <CLabel variant="custom-checkbox" htmlFor={item.code}>
                  {/* {item.code.split(/[._]/)[1]} */}
                  {item.code.split(/[.]/)[1].replace('_', " ")}
                </CLabel>
              </CFormGroup>
            </CCol>
          ))}
        </CCol>
      ));
    }
    return render;
  };

  return (
    <>
      {isLoading ? (
        <CSpinner color="secondary" />
      ) : (
        <CRow>
          <CCol>
            <CCard>
              <CCardHeader>
                <h5 className="float-left pt-2">
                  Role Form
                </h5>
                <CButton
                  color="info"
                  className="mx-2 px-4 float-right"
                  size="md"
                  onClick={() => isValidated()}
                  disabled={isEdit && !isAllowedToEdit}
                >
                  Save
                  {isHandlingSave && (
                    <CSpinner size="sm" color="secondary ml-2" />
                  )}
                </CButton>
              </CCardHeader>
              <CCardBody>
                <CRow className="px-3 mb-4">
                  <CCol lg="6" className="mb-3">
                    <CLabel>
                      <span className="text-danger mr-1">*</span>
                      Name
                    </CLabel>
                    <CInput
                      value={data.name}
                      onChange={(e) => handleOnChange("name", e.target.value)}
                      type="text"
                      placeholder="Enter Role Name"
                      invalid={
                        (showError && !isNotEmptyString(data.name)) ||
                        (isNotEmptyString(data.name) && roleNameExist)
                      }
                      disabled={isEdit && !isAllowedToEdit}
                    />
                    {showError && !isNotEmptyString(data.name) && (
                      <small className="text-danger mt-2">
                        This field is required.
                      </small>
                    )}
                    {isNotEmptyString(data.name) && roleNameExist && (
                      <small className="text-danger mt-2">
                        Sorry, that role name is already taken. Please provide
                        another one.
                      </small>
                    )}
                  </CCol>
                  <CCol lg="6" className="mb-3">
                    <CLabel>Description</CLabel>
                    <CInput
                      value={data.description}
                      onChange={(e) =>
                        handleOnChange(
                          "description",
                          e.target.value.replace(/[^a-zA-Z0-9 ]/g, "")
                        )
                      }
                      type="text"
                      placeholder="Enter Description"
                      disabled={isEdit && !isAllowedToEdit}
                    />
                  </CCol>
                </CRow>
                <h4>Modules and permissions</h4>
                {showError && !isNotEmptyArray(data.permissions) && (
                  <p className="text-danger mt-2 small">
                    Please select at least 1 permission.
                  </p>
                )}
                <CRow className="px-4">
                  {renderPermissions(permissionGroup)}
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}
      {confirmationModal && (
        <Modal
          show={confirmationModal}
          toggle={() => setConfirmationModal(!confirmationModal)}
          headerText={
            match.params.id
              ? "Are you sure you want to update this role?"
              : "Are you sure you want to create new role?"
          }
          closeText="Cancel"
          callbackText="Continue"
          onCallback={() => handleSave()}
          buttonType="info"
          loading={isHandlingSave}
        >
          <div className="text-center">
            <h4>{data.name}</h4>
          </div>
        </Modal>
      )}
    </>
  );
};

export default RoleForm;
