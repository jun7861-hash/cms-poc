import React, { useState, useEffect /*useCallback*/ } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
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
import * as userActions from "store/user/actions";
import { getAllRoles } from "core/services/user";
import { constructQueryParam, isNotEmptyString } from "core/helpers";

const RoleManagement = () => {
  const dispatch = useDispatch();
  const roleList = useSelector((state) => state.user.roleList);
  const roleForm = useSelector((state) => state.user.roleForm);
  const queryPage = useLocation().search.match(/page=([0-9]+)/, "");
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1);
  const [page, setPage] = useState(currentPage);
  const [isHandling, setIsHandling] = useState(false);
  const [searchText, setSearchText] = useState("");
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

  /**
   * update page when current page is not equal to currentPage
   */
  useEffect(() => {
    currentPage !== page && setPage(currentPage);
  }, [currentPage, page]);

  /**
   * async function that fetches all article data
   * applies all available filters including paginations
   */
  const loadData = async () => {
    if (!isHandling) {
      setIsHandling(true);
      const query = constructQueryParam(filters);
      const res = await getAllRoles(query);
      if (res) {
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
   * refresh table data when filter changed
   */
  useEffect(() => {
    loadData();
  }, [filters?.limit, filters?.page, filters?.search]); /*eslint-disable-line*/

  /**
   * handles updating pagination state
   * @param {string} type
   * - key of the objective state
   * @param {string} value
   * - value of the objective state
   */
  const handlePagination = (type, value) => {
    if (type === "current") {
      setFilter({
        ...filters,
        page: value,
      });
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
    setSearchText("");
    setFilter({
      limit: filters.limit,
      page: filters.page,
    });
  };

  return (
    <React.Fragment>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              <h5>Manage Roles</h5>
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
                        page: "1",
                      });
                    }}
                  >
                    <CInputGroup>
                      <CInput
                        placeholder="Search Role by ID or Name"
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
                      No roles found. Change your search parameters and try
                      submitting again
                    </p>
                  )
                }
                loading={isHandling}
                items={roleList}
                border
                fields={[
                  {
                    key: "role_id",
                    label: "ID",
                    _style: { textAlign: "center", width: "50px" },
                  },
                  {
                    key: "name",
                    label: "NAME",
                    _style: { textAlign: "center" },
                  },
                  {
                    key: "description",
                    label: "DESCRIPTION",
                    _style: { textAlign: "center" },
                  },
                ]}
                hover
                // itemsPerPage={
                //   pagination ? parseInt(pagination?.perPage) : roleList?.length
                // }
                // pagination
                scopedSlots={{
                  name: (item) => (
                    <td>
                      <CLink
                        className="font-weight-bold pl-2 data-link"
                        to={`/tools/role-form/${item.role_id}`}
                      >
                        {item.name}
                      </CLink>
                    </td>
                  ),
                  role_id: (item) => (
                    <td className="text-center">{item.role_id}</td>
                  ),
                  description: (item) => (
                    <td className="text-center">
                      {item.description && item.description !== null
                        ? item.description
                        : ""}
                    </td>
                  ),
                }}
              />
              {parseInt(total_rows) > 0 && (
                <CRow
                // style={{
                //   marginTop:
                //     roleList?.length > pagination?.perPage ? "-50px" : "0",
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
      {roleForm.open && (
        <roleormModal
          data={roleForm?.data}
          userForm={roleForm}
          toggleModal={() =>
            dispatch(userActions.updateUserFormModal(!roleForm.open, null))
          }
        />
      )}
    </React.Fragment>
  );
};

export default RoleManagement;
