import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
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
import { getSectionsList } from "core/services/sections";
import { isNotEmptyString, constructQueryParam } from "core/helpers";

const Sections = () => {
  // const sectionsList = useSelector((state) => state.tools.sectionsList);
  // const userPermissions = useSelector((state) => state.master.userPermissions);
  // const isAllowedToView = userPermissions.includes("Section.View");
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isHandling, setIsHandling] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    next: "",
    perPage: 30,
    previous: 0,
    currentPageRows: "1 - 0",
  });
  const [filters, setFilter] = useState({
    limit: 30,
    page: 1,
  });
  const [total_rows, setTotal_rows] = useState(0);
  const [sectionsList, setSectionList] = useState(0);

  /**
   * async function that fetches all section data
   * applies all available filters including paginations
   */
  const loadData = async () => {
    if (!isHandling) {
      setIsHandling(true);
      const query = constructQueryParam(filters);
      const res = await getSectionsList(query);
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
            currentPageRows: `1 - ${res.total_rows}`,
          });
        }
        setTotal_rows(res.total_rows);
        const appendData = {
          section_id: "",
          section: "Uncategorized",
          url: "uncategorized",
          parent_section: "",
        };
        !isNotEmptyString(filterStatus) &&
          !isNotEmptyString(searchText) &&
          filters?.page?.toString() === "1" &&
          res.data?.unshift(appendData);
        setSectionList(res.data);
      }
      setIsHandling(false);
    }
  };

  /**
   * table columns
   */
  const fields = [
    { key: "section_id", label: "ID" },
    { key: "section", label: "SECTION NAME", _style: { width: "30%" } },
    {
      key: "parent_section",
      label: "PARENT SECTION",
      _style: { width: "30%" },
    },
    {
      key: "url",
      label: "SECTION URL",
      sorter: false,
      _style: { width: "35%" },
    },
    { key: "status", label: "STATUS", sorter: true, _style: { width: "5%" } },
  ];

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
    setShowFilter(false);
    setFilterStatus("");
    setSearchText("");
    setFilter({
      limit: filters.limit,
      page: filters.page,
    });
  };

  /**
   * applying filter state
   */
  const handleApplyFilter = () => {
    setShowFilter(false);
    setFilter({
      ...filters,
      status: filterStatus,
      page: 1,
    });
  };

  /**
   * refresh table data when filter changed
   */
  useEffect(() => {
    loadData();
    /* eslint-disable-next-line */
  }, [filters?.limit, filters?.page, filters?.search, filters?.status]);

  return (
    <>
      <CCard>
        <CCardHeader>
          <h3>Sections</h3>
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
                    placeholder="Search Section by ID or Name"
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
                {((filters?.status && filterStatus !== "") ||
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
                  No section found. Change your search parameters and try
                  submitting again
                </p>
              )
            }
            loading={isHandling}
            items={sectionsList}
            fields={fields}
            pagination={false}
            border
            hover
            scopedSlots={{
              section: (item) => {
                if (item.section_id) {
                  return (
                    <td>
                      <CLink
                        className="font-weight-bold pl-2 data-link"
                        to={`/tools/sectionForm/${item.section_id}`}
                      >
                        {item.section}
                      </CLink>
                    </td>
                  );
                } else {
                  return (
                    <td>
                      <span className="font-weight-bold pl-2">
                        {item.section}
                      </span>
                    </td>
                  );
                }
              },
              status: (item) => {
                return (
                  <td className="text-center">
                    {item.status === 1 && (
                      <CPopover content="Active">
                        <i
                          className="material-icons text-info vertical-align-bottom"
                          style={{ fontSize: 18 }}
                        >
                          fiber_manual_record
                        </i>
                      </CPopover>
                    )}
                    {item.status === 0 && (
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
            //     sectionsList?.length > pagination?.perPage ? "-50px" : "0",
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

export default Sections;
