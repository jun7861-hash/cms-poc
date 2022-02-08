import React, { useState, useEffect } from "react";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow,
  CInputGroup,
  CInputGroupAppend,
  CInput,
  CButton,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CLabel,
  CSelect,
  CDropdown,
  CLink,
  CPopover,
  CForm,
} from "@coreui/react";
import { useSelector } from "react-redux";
import { getAllTag } from "core/services/tags";
import { constructQueryParam, isNotEmptyString } from "core/helpers";

const Tags = () => {
  const userPermissions = useSelector((state) => state.master.userPermissions);
  // eslint-disable-next-line
  const isAllowedToView = userPermissions.includes("Tag.View");
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isHandling, setIsHandling] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    next: "",
    perPage: 30,
    previous: 0,
  });
  const [tagList, setTagList] = useState([]);
  const [filters, setFilter] = useState({
    limit: 30,
    page: 1,
  });
  const [total_rows, setTotal_rows] = useState(0);

  const fields = [
    {
      key: "tag_id",
      label: "ID",
      _classes: "text-center",
    },
    { key: "name", label: "TAG NAME" },
    { key: "slug", label: "SLUG", _style: { width: "30%" } },
    {
      key: "type",
      label: "TYPE",
      _style: { width: "10%" },
      _classes: "text-center",
    },
    {
      key: "status",
      label: "STATUS",
      _style: { width: "10%" },
      _classes: "text-center",
    },
  ];

  /**
   * pagination filter helper
   * @param {string}​ type - page
   * @param {number}​ value - pagination number
   * @return {object} state - new filter object
   */
  const handleFilter = (type, value) => {
    setFilter({
      ...filters,
      [type]: value,
    });
  };

  /**
   * pagination handler
   * @param {string}​ type - page
   * @param {number}​ value - pagination number
   * @return {object} state - new pagination object
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

  // load list of tags base on query or filter
  const loadData = async () => {
    if (!isHandling) {
      setIsHandling(true);
      const query = constructQueryParam(filters);
      const res = await getAllTag(query);
      if (res) {
        setTagList(res.data);
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

  // remove applied filter/s
  const handleClearFilter = () => {
    setShowFilter(false);
    setFilterType("");
    setFilterStatus("");
    setSearchText("");
    setFilter({
      limit: filters.limit,
      page: filters.page,
    });
  };

  // apply constructed query/params to filter
  const handleApplyFilter = () => {
    setShowFilter(false);
    setFilter({
      ...filters,
      status: filterStatus,
      type: filterType,
      page: 1,
    });
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters?.limit,
    filters?.page,
    filters?.search,
    filters?.type,
    filters?.status,
  ]);

  return (
    <>
      <CCard>
        <CCardHeader>
          <h3>Tags</h3>
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
                    placeholder="Search Item by ID or Tag"
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
                {((filters?.type && filterType !== "") ||
                  (filters?.status && filterStatus !== "") ||
                  (filters?.search && isNotEmptyString(filters?.search))) && (
                  <CButton
                    color="danger"
                    shape="square"
                    onClick={() => handleClearFilter()}
                  >
                    Clear Filter
                  </CButton>
                )}
                <CDropdown className="dropdown">
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
                      <CLabel>Type</CLabel>
                      <CSelect
                        custom
                        className="d-block"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value="">All Types</option>
                        <option value="1">Visible</option>
                        {/* <option value='0'>Invisible</option> */}
                      </CSelect>
                    </CDropdownItem>
                    <CDropdownItem header>
                      <CLabel>Status</CLabel>
                      <CSelect
                        custom
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
                        onClick={() => setShowFilter(false)}
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
                  No tags found. Change your search parameters and try
                  submitting again
                </p>
              )
            }
            striped
            loading={isHandling}
            items={tagList}
            fields={fields}
            border
            hover
            scopedSlots={{
              name: (item) => {
                return (
                  <td>
                    <CLink
                      className="font-weight-bold pl-2 data-link"
                      to={`/tools/tagForm/${item.tag_id}`}
                    >
                      {item.name}
                    </CLink>
                  </td>
                );
              },
              type: (item) => {
                return (
                  <td className="text-center">
                    {item.type.toString() === "1" && (
                      <p className="mb-0">Visible</p>
                    )}
                    {item.type.toString() === "0" && (
                      <p className="mb-0">Invisible</p>
                    )}
                  </td>
                );
              },
              status: (item) => {
                return (
                  <td className="text-center">
                    {item.status.toString() === "1" && (
                      <CPopover content="Active">
                        <i
                          className="material-icons text-info vertical-align-bottom"
                          style={{ fontSize: 18 }}
                        >
                          fiber_manual_record
                        </i>
                      </CPopover>
                    )}
                    {item.status.toString() === "0" && (
                      <CPopover content="Inactive">
                        <i
                          className="material-icons text-danger vertical-align-bottom"
                          style={{ fontSize: 18 }}
                        >
                          fiber_manual_record
                        </i>
                      </CPopover>
                    )}
                  </td>
                );
              },
            }}
          />
          {parseInt(total_rows) > 0 && (
            <CRow
            // style={{
            //   marginTop:
            //     tagList?.length > pagination?.perPage ? "-50px" : "0",
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
                    <span className="material-icons">keyboard_arrow_left</span>
                  </CButton>
                  <CButton
                    className="ml-2 d-flex border"
                    onClick={() =>
                      handlePagination("current", pagination?.next)
                    }
                    disabled={isHandling || pagination.next === ""}
                  >
                    <span className="material-icons">keyboard_arrow_right</span>
                  </CButton>
                </div>
              </CCol>
            </CRow>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default Tags;
