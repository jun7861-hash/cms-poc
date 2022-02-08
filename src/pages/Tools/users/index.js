import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CCard,
  CCardBody,
  CButton,
  CCol,
  CDataTable,
  CRow,
  CSelect,
  CInput,
  CInputGroup,
  CInputGroupAppend,
  CCardHeader,
  CLabel,
  CTooltip,
  CLink,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CForm,
  CSwitch,
} from "@coreui/react";
import * as masterActions from "store/master/actions";
import Modal from "components/Modal";
import { getAllUser, updateUserById, getRoleOps } from "core/services/user";
import {
  isNotEmptyString,
  constructQueryParam,
  isNotEmptyArray,
} from "core/helpers";

const UserManagement = () => {
  const dispatch = useDispatch();
  const userPermissions = useSelector((state) => state.master.userPermissions);
  // const isAllowedToView = userPermissions.includes("User.View");
  const isAllowedToDisable = userPermissions.includes("User.Disable");
  const [disableUserModal, setDisableUserModal] = useState({
    open: false,
    data: {},
  });
  const [isHandling, setIsHandling] = useState(false);
  const [isHandlingDelete, setIsHandlingDelete] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    next: "",
    perPage: 30,
    previous: 0,
  });
  const [filters, setFilter] = useState({
    limit: 30,
    page: 1,
  });
  const [total_rows, setTotal_rows] = useState(0);
  const [showFilter, setShowFilter] = useState(false);
  const [userList, setUserList] = useState([]);
  const [roleOps, setRoleOps] = useState([]);

  /**
   * handles modals inside content dashboard.
   * @param {string} type
   * - The type of modals: disableModal
   * @param {object} data
   * - Passing data inside modal
   */
  const toggleModal = (type, data) => {
    if (type === "disableUserModal") {
      setDisableUserModal({
        ...disableUserModal,
        open: !disableUserModal.open,
        data: data,
      });
    }
  };

  /**
   * fetch role name by role id
   * @param {number} role_id - user's role id
   */
  const getRole = (role_id) => {
    const filter = roleOps?.filter(
      (role) => role.value?.toString() === role_id?.toString()
    );
    return filter?.length > 0 ? filter[0]?.label : "";
  };

  /**
   * handling disabling a user
   * @param {number} userId - user's id
   * @param {string} status - to enable/disables status 1 || 0
   */
  const handleDisable = async (userId, status) => {
    if (isAllowedToDisable) {
      setIsHandlingDelete(true);
      try {
        const payload = {
          status: status === 1 ? "0" : "1",
        };
        const res = await updateUserById(payload, userId);
        if (res.successful) {
          toggleModal("disableUserModal", null);
          dispatch(
            masterActions.updateNotificationModal({
              open: true,
              type: "success",
              bodyText: `User has been ${
                status === 1 ? "disabled" : "enabled"
              } successfully`,
              callback: async (closeModal) => {
                closeModal();
                loadData();
              },
            })
          );
        }
      } catch (error) {
        dispatch(
          masterActions.updateNotificationModal({
            open: true,
            type: "success",
            bodyText: error,
          })
        );
      }
      setIsHandlingDelete(false);
    }
  };

  /**
   * handles updating filter state
   * @param {string} type
   * - key of the objective state
   * @param {string} value
   * - value of the objective state
   */
  const handleFilter = (type, value) => {
    setFilter({
      ...filters,
      [type]: value,
    });
  };

  /**
   * handles updating pagination state
   * @param {string} type
   * - key of the objective state
   * @param {string} value
   * - value of the objective state
   */
  const handlePagination = (type, value) => {
    if (type === "current") {
      handleFilter("page", value);
    } else if (type === "perPage") {
      setFilter({
        ...filters,
        page: 1,
        limit: value,
      });
    } else {
      setPagination({
        ...pagination,
        [type]: value,
      });
    }
  };

  /**
   * clearing filters in article dashboard
   * setting filter states to its initial state
   */
  const handleClearFilter = () => {
    setFilterRole("");
    setSearchText("");
    setFilterStatus("");
    setFilter({
      limit: filters.limit,
      page: filters.page,
    });
  };

  /**
   * applying filter state
   */
  const handleApplyFilter = () => {
    setFilter({
      ...filters,
      role_id: filterRole,
      status: filterStatus,
      page: 1,
    });
    setShowFilter(!showFilter);
  };

  /**
   * async function that fetches all user data
   * applies all available filters including paginations
   */
  const loadData = async () => {
    if (!isHandling) {
      setIsHandling(true);
      const query = constructQueryParam(filters);
      const res = await getAllUser(query);
      if (res) {
        setUserList(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
          setFilter({
            ...filters,
            limit: res.pagination.perPage,
            page: res.pagination.current,
          });
        } else {
          setPagination({
            current: 1,
            next: "",
            perPage: filters.limit,
            previous: 0,
          });
        }
        setTotal_rows(res.total_rows);
      }
      setIsHandling(false);
    }
  };

  /**
   * async function that fetches active roles in the CMS
   */
  const loadRoleOptions = async () => {
    setIsHandling(true);
    const res = await getRoleOps();
    if (res) {
      const formatToOps = res.map((role) => {
        return {
          value: role.role_id,
          label: role.name,
        };
      });
      setRoleOps(formatToOps);
    }
    setIsHandling(false);
  };

  useEffect(() => {
    loadRoleOptions();
  }, []);

  /**
   * refresh table data when filter changed
   */
  useEffect(() => {
    loadData();
    /* eslint-disable-next-line */
  }, [
    filters?.limit,
    filters?.page,
    filters?.search,
    filters?.role_id,
    filters?.status,
  ]);

  return (
    <React.Fragment>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <h5>User Management</h5>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md="4" className="mb-3">
                  <CForm
                    onSubmit={(e) => {
                      e.preventDefault();
                      setFilter({
                        ...filters,
                        search: searchText,
                        page: 1,
                      });
                    }}
                  >
                    <CInputGroup className="search-user">
                      <CInput
                        placeholder="Search Users by Name or Email"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                      <CInputGroupAppend>
                        <CButton type="submit" color="info" className="py-0">
                          <i className="material-icons">search</i>
                        </CButton>
                      </CInputGroupAppend>
                    </CInputGroup>
                  </CForm>
                </CCol>
                <CCol md="8" className="mb-3">
                  <div className="d-flex justify-content-end">
                    <p className="d-flex align-items-center mb-0 mr-3 font-weight-bold">
                      {total_rows}&nbsp;entries
                    </p>
                    {((filters?.role_id && filterRole !== "") ||
                      (filters?.status && filterStatus !== "") ||
                      (filters?.search &&
                        isNotEmptyString(filters?.search))) && (
                      <CButton
                        color="danger"
                        shape="square"
                        onClick={() => handleClearFilter()}
                      >
                        Clear Filter
                      </CButton>
                    )}
                    <CDropdown className="float-right dropdown">
                      <CDropdownToggle
                        onClick={() => setShowFilter(!showFilter)}
                        caret
                        className="dropdown-filter-btn"
                        shape="square"
                      >
                        Filter
                      </CDropdownToggle>
                      <CDropdownMenu
                        show={showFilter}
                        className={`dropdown-filter ${
                          showFilter ? "d-block" : "d-none"
                        }`}
                        placement="bottom-end"
                      >
                        <CDropdownItem header>
                          <CLabel>Role</CLabel>
                          <CSelect
                            custom
                            name="role"
                            className="d-block"
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                          >
                            <option value="">Select Role</option>
                            {roleOps &&
                              isNotEmptyArray(roleOps) &&
                              roleOps.map((role) => (
                                <option value={role.value}>{role.label}</option>
                              ))}
                          </CSelect>
                        </CDropdownItem>
                        <CDropdownItem header>
                          <CLabel>Status</CLabel>
                          <CSelect
                            custom
                            name="status"
                            className="d-block"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <option value="">Select Status</option>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                          </CSelect>
                        </CDropdownItem>
                        <CDropdownItem header>
                          <CButton
                            size="sm"
                            className="mr-1"
                            color="info"
                            onClick={() => handleApplyFilter()}
                          >
                            Apply
                          </CButton>
                          <CButton
                            size="sm"
                            color="secondary"
                            onClick={() => setShowFilter(!showFilter)}
                          >
                            Cancel
                          </CButton>
                        </CDropdownItem>
                      </CDropdownMenu>
                    </CDropdown>
                  </div>
                </CCol>
              </CRow>

              <CDataTable
                noItemsViewSlot={
                  isHandling ? (
                    <p className="text-center py-5">Loading...</p>
                  ) : (
                    <p className="text-center py-5">
                      No users found. Change your search parameters and try
                      submitting again.
                    </p>
                  )
                }
                striped
                loading={isHandling}
                items={userList}
                border
                fields={[
                  {
                    key: "user_id",
                    label: "ID",
                    _classes: "text-center",
                  },
                  {
                    key: "name",
                    label: "NAME",
                    _style: { textAlign: "center", width: "40%" },
                  },
                  {
                    key: "email",
                    label: "EMAIL",
                    _style: { textAlign: "center", width: "30%" },
                  },
                  {
                    key: "role_id",
                    label: "ROLE",
                    _style: { width: "15%", textAlign: "center" },
                  },
                  {
                    key: "status",
                    label: "STATUS",
                    _style: { textAlign: "center", width: "10%" },
                  },
                  {
                    key: "actions",
                    label: "ACTIONS",
                    _style: { width: "5%", textAlign: "center" },
                  },
                ]}
                hover
                itemsPerPage={30}
                scopedSlots={{
                  actions: (item) => {
                    return (
                      <td className="text-center btn-icons">
                        <CTooltip
                          advancedOptions={{
                            touch: false,
                          }}
                          content="Edit"
                        >
                          <CLink to={`/tools/user-form/${item.user_id}`}>
                            <i className="material-icons tiny">create</i>
                          </CLink>
                        </CTooltip>
                      </td>
                    );
                  },
                  name: (item) => <td>{item.display_name}</td>,
                  role_id: (item) => (
                    <td className="text-center">{getRole(item.role_id)}</td>
                  ),
                  status: (item) => (
                    <td className="text-center">
                      <CSwitch
                        size="sm"
                        color="success"
                        labelOff="Inactive"
                        labelOn="Active"
                        checked={item.status === 1 ? true : false}
                        onChange={() => toggleModal("disableUserModal", item)}
                        disabled={!isAllowedToDisable}
                        className={`cusEl ${
                          item.status === 1 ? "active" : "inactive"
                        }`}
                      />
                    </td>
                  ),
                }}
              />

              {parseInt(total_rows) > 0 && (
                <CRow
                // style={{
                //   marginTop:
                //     userList?.length > pagination?.perPage ? "-50px" : "0",
                // }}
                >
                  <CCol
                    md="6"
                    className="d-flex justify-content-lg-start justify-content-center mb-3"
                  >
                    <div className="d-flex">
                      <CRow className="mx-0">
                        <CCol className="d-flex px-0">
                          <CButton
                            onClick={() => handlePagination("perPage", 30)}
                            variant="ghost"
                            type="button"
                            color="info"
                            disabled={pagination?.perPage.toString() === "30"}
                          >
                            30
                          </CButton>
                        </CCol>
                        <CCol className="d-flex px-0">
                          <CButton
                            onClick={() => handlePagination("perPage", 60)}
                            variant="ghost"
                            type="button"
                            color="info"
                            disabled={pagination?.perPage.toString() === "60"}
                          >
                            60
                          </CButton>
                        </CCol>
                        <CCol className="d-flex px-0">
                          <CButton
                            onClick={() => handlePagination("perPage", 90)}
                            variant="ghost"
                            type="button"
                            color="info"
                            disabled={pagination?.perPage.toString() === "90"}
                          >
                            90
                          </CButton>
                        </CCol>
                      </CRow>
                      <p className="d-flex mb-0 ml-2 align-items-center">
                        Items per page
                      </p>
                    </div>
                  </CCol>
                  <CCol
                    md="6"
                    className="d-flex justify-content-lg-end justify-content-center mb-3"
                  >
                    <div className="d-flex align-items-center">
                      <p className="mr-2 mb-0">
                        <span className="font-weight-bold">
                          {pagination.currentPageRows}
                        </span>{" "}
                        &nbsp;of&nbsp;
                        <span className="font-weight-bold">{total_rows}</span>
                      </p>
                      <CButton
                        className="d-flex border"
                        disabled={isHandling || pagination.previous === 0}
                        onClick={() =>
                          handlePagination("current", pagination?.previous)
                        }
                      >
                        <span className="material-icons">
                          keyboard_arrow_left
                        </span>
                      </CButton>
                      <CButton
                        className="ml-2 d-flex border"
                        onClick={() =>
                          handlePagination("current", pagination?.next)
                        }
                        disabled={isHandling || pagination.next === ""}
                      >
                        <span className="material-icons">
                          keyboard_arrow_right
                        </span>
                      </CButton>
                    </div>
                  </CCol>
                </CRow>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
      {disableUserModal.open && (
        <Modal
          show={disableUserModal.open}
          toggle={() => toggleModal("disableUserModal")}
          headerText={`Are you sure you want to ${
            disableUserModal.data.status === 1 ? "disable" : "enable"
          } this user?`}
          closeText="Cancel"
          callbackText="Continue"
          onCallback={() =>
            handleDisable(
              disableUserModal.data.user_id,
              disableUserModal.data.status
            )
          }
          buttonType="danger"
          loading={isHandlingDelete}
        >
          <div className="text-center">
            <h4>
              {disableUserModal.data.display_name ||
                disableUserModal.data.email}
            </h4>
            <p>
              Role:{" "}
              <span className="secondary">
                {getRole(disableUserModal.data.role_id)}
              </span>
            </p>
          </div>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default UserManagement;
