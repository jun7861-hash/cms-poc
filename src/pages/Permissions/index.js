import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  CCard,
  CCardBody,
  CButton,
  CCol,
  CDataTable,
  CRow,
  CInput,
  CInputGroup,
  CInputGroupAppend,
  CCardHeader,
  CLink,
  CForm,
} from "@coreui/react";
import { getPermissionGroupList } from "core/services/user";
import PermissionModal from "./forms/permissionForm";
import { constructQueryParam, isNotEmptyString } from "core/helpers";

const PermissionManagement = () => {
  const queryPage = useLocation().search.match(/page=([0-9]+)/, "");
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1);
  const [page, setPage] = useState(currentPage);
  const [isHandling, setIsHandling] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [permissionGroup, setPermissionGroup] = useState([]);
  const [showModal, setShowModal] = useState({
    open: false,
    data: [],
  });
  const [pagination, setPagination] = useState({
    current: 1,
    next: 2,
    perPage: 30,
    previous: 0,
    currentPageRows: "1 - 0",
  });
  const [filters, setFilter] = useState({
    limit: 30,
    page: 1,
  });
  const [total_rows, setTotal_rows] = useState(0);

  const handleFilter = (type, value) => {
    setFilter({
      ...filters,
      [type]: value,
    });
  };

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

  const loadData = async () => {
    if (!isHandling) {
      setIsHandling(true);
      const query = constructQueryParam(filters);
      const res = await getPermissionGroupList(query);
      if (res) {
        setPermissionGroup(res.data);
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
            currentPageRows: `1 - ${res.total_rows}`,
          });
        }
        setTotal_rows(res.total_rows);
      }
      setIsHandling(false);
    }
  };

  const getColumn = (permissions, plugin, column) => {
    let _plugin = plugin;
    if (plugin === "Buyers' Guide") {
      _plugin = "BG";
    }
    const isExist = permissions.filter(
      (item) => item.code === `${_plugin}.${column}` && item.status === 1
    );
    if (isExist.length > 0) {
      return <span className="material-icons">check</span>;
    } else {
      return "";
    }
  };

  const handleClearFilter = () => {
    setSearchText("");
    setFilter({
      limit: filters.limit,
      page: filters.page,
    });
  };

  useEffect(() => {
    currentPage !== page && setPage(currentPage);
  }, [currentPage, page]);

  useEffect(() => {
    loadData();
  }, [filters?.limit, filters?.page, filters?.search]); /*eslint-disable-line*/

  return (
    <React.Fragment>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <h5>Permissions</h5>
            </CCardHeader>
            <CCardBody>
              <CRow>
                <CCol md="3" className="mb-3">
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
                    <CInputGroup>
                      <CInput
                        placeholder="Search Permission by Name"
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
                <CCol md="9" className="mb-3">
                  <div className="d-flex justify-content-end">
                    <p className="d-flex align-items-center mb-0 mr-3 font-weight-bold">
                      {total_rows}&nbsp;entries
                    </p>
                    {filters?.search && isNotEmptyString(filters?.search) && (
                      <CButton
                        color="danger"
                        shape="square"
                        onClick={() => handleClearFilter()}
                      >
                        Clear Filter
                      </CButton>
                    )}
                  </div>
                </CCol>
              </CRow>
              <CDataTable
                noItemsViewSlot={
                  isHandling ? (
                    <p className="text-center py-5">Loading...</p>
                  ) : (
                    <p className="text-center py-5">
                      No permissions found. Change your search parameters and
                      try submitting again
                    </p>
                  )
                }
                loading={isHandling}
                items={permissionGroup}
                itemsPerPage={
                  pagination
                    ? parseInt(pagination?.perPage)
                    : permissionGroup?.length
                }
                border
                fields={[
                  {
                    key: "plugin",
                    label: "NAME",
                    _style: { textAlign: "center" },
                  },
                  // {
                  //   key: "description",
                  //   label: "DESCRIPTION",
                  //   _style: { textAlign: "center" },
                  // },
                  {
                    key: "list",
                    label: "LIST",
                    _style: { textAlign: "center" },
                  },
                  {
                    key: "create",
                    label: "CREATE",
                    _style: { textAlign: "center" },
                  },
                  {
                    key: "edit",
                    label: "EDIT",
                    _style: { textAlign: "center" },
                  },
                  {
                    key: "disable",
                    label: "DISABLE",
                    _style: { textAlign: "center" },
                  },
                  {
                    key: "delete",
                    label: "DELETE",
                    _style: { textAlign: "center" },
                  },
                  {
                    key: "view",
                    label: "VIEW",
                    _style: { textAlign: "center" },
                  },
                  {
                    key: "publish",
                    label: "PUBLISH",
                    _style: { textAlign: "center" },
                  },
                  // {
                  //   key: "export",
                  //   label: "EXPORT",
                  //   _style: { textAlign: "center" },
                  // },
                  {
                    key: "change_slug",
                    label: "CHANGE SLUG",
                    _style: { textAlign: "center" },
                  },
                  {
                    key: "change_section",
                    label: "CHANGE SECTION",
                    _style: { textAlign: "center" },
                  },
                  {
                    key: "unlock",
                    label: "UNLOCK",
                    _style: { textAlign: "center" },
                  },
                ]}
                hover
                pagination
                scopedSlots={{
                  plugin: (item) => (
                    <td>
                      <CLink
                        className="font-weight-bold pl-2 data-link"
                        onClick={() =>
                          setShowModal({
                            open: !showModal.open,
                            data: item,
                          })
                        }
                      >
                        {item.plugin}
                      </CLink>
                    </td>
                  ),
                  description: (item) => (
                    <td className="text-center">
                      {item.description && item.description !== null
                        ? item.description
                        : ""}
                    </td>
                  ),
                  list: (item) => (
                    <td className="text-center">
                      {getColumn(item.permissions, item.plugin, "List")}
                    </td>
                  ),
                  disable: (item) => (
                    <td className="text-center">
                      {getColumn(item.permissions, item.plugin, "Disable")}
                    </td>
                  ),
                  delete: (item) => (
                    <td className="text-center">
                      {getColumn(item.permissions, item.plugin, "Delete")}
                    </td>
                  ),
                  publish: (item) => (
                    <td className="text-center">
                      {getColumn(item.permissions, item.plugin, "Publish")}
                    </td>
                  ),
                  create: (item) => (
                    <td className="text-center">
                      {getColumn(item.permissions, item.plugin, "Create")}
                    </td>
                  ),
                  edit: (item) => (
                    <td className="text-center">
                      {getColumn(item.permissions, item.plugin, "Edit")}
                    </td>
                  ),
                  view: (item) => (
                    <td className="text-center">
                      {getColumn(item.permissions, item.plugin, "View")}
                    </td>
                  ),
                  // export: (item) => (
                  //   <td className="text-center">
                  //     {getColumn(item.permissions, item.plugin, "Export")}
                  //   </td>
                  // ),
                  change_slug: (item) => (
                    <td className="text-center">
                      {getColumn(item.permissions, item.plugin, "Change_Slug")}
                    </td>
                  ),
                  change_section: (item) => (
                    <td className="text-center">
                      {getColumn(
                        item.permissions,
                        item.plugin,
                        "Change_Section"
                      )}
                    </td>
                  ),
                  unlock: (item) => (
                    <td className="text-center">
                      {getColumn(item.permissions, item.plugin, "Unlock")}
                    </td>
                  ),
                }}
              />
              {parseInt(total_rows) > 0 && (
                <CRow
                  style={{
                    marginTop:
                      permissionGroup?.length > pagination?.perPage
                        ? "-50px"
                        : "0",
                  }}
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
      {showModal.open && (
        <PermissionModal
          show={showModal.open}
          onClose={() =>
            setShowModal({
              open: !showModal.open,
              data: [],
            })
          }
          data={showModal.data}
        />
      )}
    </React.Fragment>
  );
};

export default PermissionManagement;
