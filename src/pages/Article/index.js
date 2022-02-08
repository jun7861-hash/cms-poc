import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
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
  CAlert,
  CLabel,
  CTooltip,
  CLink,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CSpinner,
  CForm,
} from "@coreui/react";
import Select, { components } from "react-select";
import Modal from "components/Modal";
import VersionHistoryModal from "components/version-history";
import HistoryModal from "./sideModals/historyModal";
import PreviewModal from "components/preview-modal";
import ArticleInsightsModal from "./sideModals/insightsModal";
import {
  parseDate,
  isNotEmptyObject,
  isNotEmptyArray,
  isNotEmptyString,
  removeSaveNotifId,
} from "core/helpers";
import {
  editArticle,
  getAllUserByAuthors,
  getArticleById,
  filterArticles,
  lockUnlockArticle,
} from "core/services/article";
import { getSectionOps, getParentsGrouped } from "core/services/sections";
import { getTagOps } from "core/services/tags";
import { refreshTokenOnEnter } from "core/services/token";
import * as masterActions from "store/master/actions";
import RangePicker from "components/date-range-picker";
import filterLogo from "assets/icons/filter.svg";

const Article = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.master.currentUser);
  const userPermissions = useSelector((state) => state.master.userPermissions);
  const isAllowedToView = userPermissions.includes("Article.View");
  const isAllowedToEdit = userPermissions.includes("Article.Edit");
  const isAllowedToDisable = userPermissions.includes("Article.Disable");
  const isAllowedToUnlock = userPermissions.includes("Article.Unlock");
  const queryPage = useLocation().search.match(/page=([0-9]+)/, "");
  const currentPage = Number(queryPage && queryPage[1] ? queryPage[1] : 1);
  const [page, setPage] = useState(currentPage);

  //modals
  const [disableModal, setDisableModal] = useState({
    open: false,
    data: {},
  });
  const [pushNotifModal, setPushNotifModal] = useState(false);
  const [historyModal, setHistoryModal] = useState({
    open: false,
    data: {},
  });
  const [previewModal, setPreviewModal] = useState({
    open: false,
    data: {},
  });
  const [insightsModal, setInsightsModal] = useState(false);
  const [versionHistoryModal, setVersionHistoryModal] = useState({
    open: false,
    data: {},
  });
  const [unlockModal, setUnlockModal] = useState({
    open: false,
    data: {},
  });

  //articleData
  const [showFilter, setShowFilter] = useState(false);

  //pagination
  const [articleList, setArticleData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    next: "",
    perPage: 30,
    previous: 0,
  });
  const [filters, setFilter] = useState({
    limit: 30,
    page: 1,
    sort: "recent",
  });

  //loading
  const [isHandling, setIsHandling] = useState(false);
  const [isLoadingArticle, setIsLoadingArticle] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  //pagination
  const [total_rows, setTotal_rows] = useState(0);

  //dropdown contents
  const [sectionOps, setSectionOps] = useState([]);
  const [sectionGrouped, setSectionGrouped] = useState([]);
  const [authorOps, setAuthorOps] = useState([]);
  const [authorOpsCopy, setAuthorOpsCopy] = useState([]);
  const [tagOps, setTagOps] = useState([]);
  const [tagOpsCopy, setTagOpsCopy] = useState([]);

  // date range
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [date, setDate] = useState({
    startDate: "",
    endDate: "",
  });
  // date range

  //filters
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSection, setFilterSection] = useState({
    section: "",
    section_id: "",
  });
  const [filterArrangement, setFilterArrangement] = useState("sort");
  const [filterAuthor, setFilterAuthor] = useState([]);
  const [filterTag, setFilterTag] = useState([]);

  //do not show dropdown when input search is empty
  const [showDropdownAuthor, setShowDropdownAuthor] = useState(true);
  const [showDropdownTag, setShowDropdownTag] = useState(true);

  /**
   * handles modals inside content dashboard.
   * @param {string} type
   * - The type of modals: disableModal || unlock || historyModal || previewModal
   * @param {object} data
   * - Passing data inside modal
   */
  const toggleModal = (type, data) => {
    if (type === "disableModal") {
      setDisableModal({
        open: !disableModal.open,
        data: data ? data : {},
      });
    } else if (type === "pushNotifModal") {
      setPushNotifModal(!pushNotifModal);
    } else if (type === "historyModal") {
      setHistoryModal({
        open: !historyModal.open,
        data: data ? data : {},
      });
    } else if (type === "previewModal") {
      setPreviewModal({
        open: !previewModal.open,
        data: data ? data : {},
      });
    } else if (type === "insightsModal") {
      setInsightsModal(!insightsModal);
    } else if (type === "unlock") {
      setUnlockModal({
        open: !unlockModal.open,
        data: data ? data : {},
      });
    }
  };

  /**
   * async function that fetches all section data.
   * getSectionOps - list of all sections
   * getParentsGrouped - sections grouped by parent sections
   */
  const loadSectionData = async () => {
    // api calls
    const sections = await getSectionOps("");
    const parentSection = await getParentsGrouped("");
    // construct data
    const sectionList =
      sections &&
      sections.map((s) => ({
        value: s.section,
        label: s.section,
        section_id: s.section_id,
        section_name: s.section,
        url: s.url,
        subsection: s.subsection,
      }));
    const grouped =
      parentSection &&
      parentSection.map((parent) => ({
        value: parent.section,
        label: parent.section,
        section_id: parent.section_id,
        section_name: parent.section,
        url: parent.url,
        subsection: parent.subsection,
      }));
    // set to state
    setSectionGrouped(grouped);
    setSectionOps(sectionList);
    return sectionList;
  };

  /**
   * async function that fetches all authors data.
   * getAllUserByAuthors - list of all active users inside the cms
   */
  const loadAuthorData = async () => {
    // api call
    const authors = await getAllUserByAuthors();
    // construct data
    if (authors && isNotEmptyArray(authors)) {
      const authorOptions = authors
        ?.filter((item) => item.status === 1)
        ?.map((a) => ({
          value: a.display_name,
          label: a.display_name,
          user_id: a.user_id,
          display_name: a.display_name,
        }));
      // set to state
      setAuthorOps(authorOptions);
      setAuthorOpsCopy(authorOptions);
      return authorOptions;
    }
  };

  /**
   * async function that fetches all tags data.
   * getTagOps - list of all active tags
   */
  const loadTags = async () => {
    //api calls
    const tags = await getTagOps();
    // construct data
    if (tags && isNotEmptyArray(tags)) {
      const tagOptions = tags.map((tag) => ({
        value: tag.name,
        label: tag.name,
        tag_id: tag.tag_id,
        type: tag.type,
      }));
      // set to state
      setTagOps(tagOptions);
      setTagOpsCopy(tagOptions);
      return tagOptions;
    }
  };

  /**
   * async function that fetches all article data
   * applies all available filters including paginations
   */
  const loadData = async () => {
    if (!isHandling) {
      setIsHandling(true);
      //appending limit(page limit) and page(page number) to filter
      const _filter = {
        ...filters,
        limit: filters.limit.toString(),
        page: filters.page.toString(),
      };
      //api calls
      const res = await filterArticles(_filter);
      if (res) {
        setArticleData(res.data);
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

  /**
   * call all async functions in one.
   */
  const loadAllData = async () => {
    setIsHandling(true);
    const sections = loadSectionData();
    const authors = loadAuthorData();
    const articles = loadData();
    const tags = loadTags();
    await Promise.all([authors, sections, articles, tags]);
    setIsHandling(false);
  };

  useEffect(() => {
    loadAllData();
  }, []); /* eslint-disable-line */

  /**
   * update page when current page is not equal to currentPage
   */
  useEffect(() => {
    currentPage !== page && setPage(currentPage);
  }, [currentPage, page]);

  const insightsData = [
    {
      metric: "Ave. Time on Page",
      this_month: "0",
      vs_section: "",
      vs_site: "",
      all_time: "0",
    },
    {
      metric: "Pageviews",
      this_month: "0",
      vs_section: "",
      vs_site: "",
      all_time: "0",
    },
    {
      metric: "Users",
      this_month: "0",
      vs_section: "",
      vs_site: "",
      all_time: "0",
    },
    {
      metric: "Likes, Shares, Comments	",
      this_month: "0",
      vs_section: "",
      vs_site: "",
      all_time: "0",
    },
  ];

  /**
   * async function handles redirection to article form
   * @param {string} id
   * - The id of the selected article
   */
  const redirectToContentForm = async (id) => {
    //call refresh token every entry of article form
    //extending the token validity to 9hours
    await refreshTokenOnEnter();
    //redirects to article form
    window.location.href = `/article/articleForm/${id}`;
  };

  /**
   * handles locking of articles when article title has been clicked inside the content dashboard
   * @param {string} id
   * - The id of the selected article
   */
  const handleLocking = async (id) => {
    //check if user has permission to view
    if (isAllowedToView) {
      const { user_id, display_name } = currentUser;
      //list of permission user should have in order to lock the article.
      //do not lock article if user has only view permission
      const permissionsToLock = [
        "Article.Edit",
        "Article.Disable",
        "Article.Publish",
        "Article.Change_Slug",
        "Article.Change_Section",
      ];
      removeSaveNotifId(id);
      setIsLoadingArticle(true);
      //check if user has other permissions besides "View"
      if (userPermissions.some((code) => permissionsToLock.includes(code))) {
        //get article data by id
        const res = await getArticleById(id);
        const resData = res?.data;
        if (isNotEmptyObject(res)) {
          if (
            !resData.locked_by ||
            resData.locked_by === null ||
            resData.locked_by === 0
          ) {
            const payload = {
              locked_by: user_id,
              locked_timestamp: parseDate(Date.now(), "YYYY-MM-DD hh:mm:ss"),
              locked_by_name: display_name,
            };
            if (res?.successful) {
              // await editArticle(payload, id);
              /**
               * call lockUnlockArticle api handler to update locking data
               * then redirect it to the article form
               */
              await lockUnlockArticle(id, "lock", payload);
              await redirectToContentForm(id);
            }
          } else {
            await redirectToContentForm(id);
          }
        }
      } else {
        await redirectToContentForm(id);
      }
      setIsLoadingArticle(false);
    } else {
      //if user has no access to view an article alert message will prompt
      alert(`You don't have permission to access this page`);
    }
  };

  /**
   * handles the disabling of a specific article
   * @param {object} data
   * - Object data of the selected article to be disabled
   */
  const handleDisableArticle = async (data) => {
    setIsDisabling(true);
    //update article data set status to "3"(disabled)
    await editArticle(
      { status: "3", with_log: "1", autosave: "0" },
      data?.article_id
    );
    setIsDisabling(false);
    toggleModal("disableModal");
    loadData();
  };

  /**
   * handles the article title (renders in "TITLE" column inside the dashboard)
   * @param {object} item
   * - Object data from the article table
   */
  const renderTitle = (item) => {
    //check if article triggers the auto_save
    if (item.auto_save === 1) {
      if (item.auto_save_by !== 0) {
        if (item.auto_save_by === currentUser?.user_id) {
          return (
            <CLink
              className="font-weight-bold pl-2 data-link"
              onClick={() => {
                if (isAllowedToView && isAllowedToEdit) {
                  setVersionHistoryModal({
                    open: true,
                    data: item,
                  });
                } else {
                  alert(`You don't have permission to access this page`);
                }
              }}
            >
              {item.title}
            </CLink>
          );
        } else {
          return <span className="pl-2 font-weight-bold">{item.title}</span>;
        }
      } else {
        return "Bad Data";
      }
    } else if (item.locked_by) {
      //check if article being locked by other user
      if (item.locked_by === currentUser?.user_id) {
        removeSaveNotifId(item?.article_id);
        return (
          <CLink
            className="font-weight-bold pl-2 data-link"
            to={`/article/articleForm/${item.article_id}`}
          >
            {item.title}
          </CLink>
        );
      } else {
        return <span className="pl-2 font-weight-bold">{item.title}</span>;
      }
    } else {
      if (item.status === 3) {
        //check if article is disabled.
        return <span className="font-weight-bold pl-2 ">{item.title}</span>;
      } else {
        //if article has no auto save, lock and not disabled call the handleLocking function.
        return (
          <CLink
            className="font-weight-bold pl-2 data-link"
            onClick={() => handleLocking(item.article_id)}
          >
            {item.title}
          </CLink>
        );
      }
    }
  };

  /**
   * handles the article section (renders in "SECTION" column inside the dashboard)
   * @param {object} item
   * - Object data from the article table
   */
  const renderSection = (item) => {
    //check if article isDisabled (status === 3) then assign a class-name to it
    const isDisabled =
      item.status === 3 ? "article-disabled text-center" : "text-center";

    //check if article triggers auto save
    if (item.auto_save === 1) {
      if (item.auto_save_by) {
        if (item.auto_save_by === currentUser?.user_id) {
          return (
            <td colSpan="3" className="bg-danger text-center v-align-middle">
              You were not able to close this article correctly. Auto-save has
              been enabled.
            </td>
          );
        } else {
          const getUserName = item.auto_save_by_name;
          return (
            <td colSpan="3" className="is-editing v-align-middle">
              {getUserName} is currently editing this article.
              {isAllowedToUnlock && (
                <i
                  className="material-icons float-right"
                  onClick={() => toggleModal("unlock", item)}
                >
                  lock_open
                </i>
              )}
            </td>
          );
        }
      } else {
        return <td colSpan="3"></td>;
      }
    } else if (item.locked_by) {
      //check if article being locked by other user
      const getUserName = item.locked_by_name;
      return (
        <td colSpan="3" className="is-editing v-align-middle">
          {item.locked_by === currentUser?.user_id
            ? `You are currently editing this article.`
            : `${getUserName} is currently editing this article.`}
          {isAllowedToUnlock && (
            <i
              className="material-icons float-right"
              onClick={() => toggleModal("unlock", item)}
            >
              lock_open
            </i>
          )}
        </td>
      );
    } else {
      //if article has no auto save, lock and not disabled call render the section as default
      return <td className={isDisabled}>{item.section_name}</td>;
    }
  };

  /**
   * unlocking article
   * @param {object} item
   * - Object data from the article table
   */
  const handleUnlock = async (item) => {
    setIsLocking(true);
    try {
      const payload = {
        locked_by: 0,
        // autosave: "0",
        auto_save: "0",
        locked_by_name: null,
        auto_save_by_name: null,
        auto_save_by: null,
      };
      // const res = await editArticle(payload, item.article_id);
      const res = await lockUnlockArticle(item.article_id, "unlock", payload);
      if (res.successful) {
        toggleModal("unlock", item);
        loadAllData();
      }
    } catch (error) {
      console.log(error);
    }
    setIsLocking(false);
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

  useEffect(() => {
    //-------------------------------------------------
    /**
     * open profile modal after successful creation of account.
     */
    //check local storage data
    const isProfileOpen = JSON.parse(localStorage.getItem("set_up_profile"));
    isProfileOpen && dispatch(masterActions.updateProfileModal(true, null));
    localStorage.removeItem("set_up_profile");
  }, []); /*eslint-disable-line*/

  /**
   * clearing filters in article dashboard
   * setting filter states to its initial state
   */
  const handleClearFilter = () => {
    setShowFilter(false);
    setFilterStatus("");
    setSearchText("");
    setFilterSection({
      section: "",
      section_id: "",
    });
    setFilterArrangement("recent");
    setFilterAuthor([]);
    setFilterTag([]);
    setDate({
      startDate: "",
      endDate: "",
    });
    setState([
      {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection",
      },
    ]);
    setFilter({
      limit: filters.limit,
      page: filters.page,
      sort: "recent",
    });
  };

  /**
   * updating state of date range filter
   */
  const handleDateRange = () => {
    const sDate = state.map((r) => r.startDate);
    const eDate = state.map((r) => r.endDate);
    const startDate = parseDate(sDate[0], "YYYY/MM/DD");
    const endDate = parseDate(eDate[0], "YYYY/MM/DD");
    setDate({
      ...date,
      startDate: startDate,
      endDate: endDate,
    });
  };

  /**
   * applying filter state
   */
  const handleApplyFilter = () => {
    setShowFilter(false);
    const authors = filterAuthor?.map((item) => item.user_id?.toString());
    const tags = filterTag?.map((item) => item.tag_id?.toString());
    setFilter({
      ...filters,
      status: filterStatus,
      authors: authors,
      tags: tags,
      // section: filterSection?.section,
      section_ids: filterSection?.subsections,
      date_from:
        parseDate(date.startDate, "YYYY-MM-DD") !== "Invalid date"
          ? parseDate(date.startDate, "YYYY-MM-DD")
          : "",
      date_to:
        parseDate(date.endDate, "YYYY-MM-DD") !== "Invalid date"
          ? parseDate(date.endDate, "YYYY-MM-DD")
          : "",
      sort: filterArrangement,
      page: 1,
    });
  };

  /**
   * updating state of section filter
   * @param {number} id
   * - id of selected section
   */
  const handleFilterSection = (id) => {
    if (id !== "") {
      //check if {id} is equal to "0" if yes set section to uncategorized
      if (id?.toString() === "0") {
        setFilterSection({
          section: "Uncategorized",
          section_id: "0",
        });
      } else {
        //filter selected section in section ops
        const getInfo = sectionOps?.filter(
          (section) => section.section_id?.toString() === id.toString()
        );
        if (getInfo?.length > 0) {
          //check if section has sub sections
          const sub_ids = getInfo[0].subsection?.map((item) =>
            item.section_id.toString()
          );
          //set state
          setFilterSection({
            section: getInfo[0].section_name,
            section_id: getInfo[0].section_id?.toString(),
            subsections:
              sub_ids?.length > 0
                ? [getInfo[0].section_id?.toString(), ...sub_ids]
                : [getInfo[0].section_id?.toString()],
          });
        }
      }
    }
  };

  /**
   * custom styles for article tag (react-select)
   */
  const colourStyles = {
    //data.type === 1: visible tags
    //data.type === 0: invisible tags
    multiValue: (styles, { data }) => {
      return {
        ...styles,
        backgroundColor: data.type === 1 ? "#3F4B62" : "rgb(230, 230, 230)",
      };
    },
    multiValueLabel: (styles, { data }) => {
      return {
        ...styles,
        color: data.type === 1 ? "#fff" : "#000",
      };
    },
    multiValueRemove: (styles, { data }) => ({
      ...styles,
      color: data.type === 1 ? "#d8dbe0" : "#8a93a2",
      ":hover": {
        backgroundColor: "transparent",
        color: data.type === 1 ? "#fff" : "#000",
      },
    }),
    option: (styles, { isSelected }) => ({
      ...styles,
      backgroundColor: isSelected ? "#fff" : "#fff",
      color: "#8C8C8C",
      fontSize: "15px",
    }),
    control: (styles) => ({
      ...styles,
      borderColor: "##3F4B62",
      boxShadow: "0 0 0 1px ##3F4B62",
      height: 112,
      alignItems: "start",
      overflow: "auto",
      ":hover": {
        borderColor: "#8C8C8C",
        boxShadow: "0 0 0 1px ##3F4B62",
      },
    }),
  };

  /**
   * custom option for article tag (react-select)
   * option with checkbox
   */
  const Option = (props) => (
    <div>
      <components.Option {...props}>
        <label className="containerLabel">
          {props.label}
          <input
            className="tag_checkbox"
            type="checkbox"
            checked={props.isSelected}
            onChange={() => null}
          />
          <span className="checkmark"></span>
        </label>

        {/* <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
          className="tag_checkbox"
        />{" "}
        <label className="v-align-middle">{props.label}</label> */}
      </components.Option>
    </div>
  );

  /**
   * custom multivalue style for article tag (react-select)
   */
  const MultiValue = (props) => (
    <components.MultiValue {...props}>
      <span className="v-align-middle">{props.data.label}</span>
    </components.MultiValue>
  );

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
    filters?.tags,
    filters?.authors,
    filters?.status,
    filters?.date_from,
    filters?.date_to,
    filters?.sort,
  ]);

  return (
    <React.Fragment>
      <CAlert color="info" className="text-center">
        For website concerns, you may contact our Technical Support team at{" "}
        <b>support@summitmedia.zendesk.com</b> or <b>0998-8404778</b>.<br />
        For office internet concerns, you may email our ISD team at{" "}
        <b>jgshelpdesk@summitmedia.com.ph.</b>
      </CAlert>
      <CRow>
        <CCol>
          <CCard>
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
                        placeholder="Search Article by ID or Title"
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
                      {isLoadingArticle && (
                        <CSpinner
                          size="sm"
                          color="secondary"
                          className="mr-2"
                        />
                      )}
                      {total_rows}&nbsp;entries
                    </p>
                    {((filters?.status && filters?.status !== "") ||
                      (filters?.section_ids &&
                        filters?.section_ids?.length > 0) ||
                      (filters?.date_from && filters?.date_from !== "") ||
                      (filters?.date_to && filters?.date_to !== "") ||
                      (filters?.sort && filters?.sort !== "recent") ||
                      (filters?.authors && isNotEmptyArray(filters?.authors)) ||
                      (filters?.tags && isNotEmptyArray(filters?.tags)) ||
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
                        <img src={filterLogo} alt="filter" />
                      </CDropdownToggle>
                      <CDropdownMenu
                        show={showFilter}
                        className={`dropdown-filter ${
                          showFilter ? "d-block" : "d-none"
                        }`}
                        placement="bottom-end"
                      >
                        <CDropdownItem header>
                          <CLabel>Publish Date Range</CLabel>
                          <RangePicker
                            value={`${date?.startDate} - ${date?.endDate}`}
                            onChange={(item) => setState([item.selection])}
                            ranges={state}
                            onClick={() => handleDateRange()}
                          />
                        </CDropdownItem>
                        <CDropdownItem header>
                          <CLabel>Sort</CLabel>
                          <CSelect
                            custom
                            name="status"
                            className="d-block font-12"
                            value={filterArrangement}
                            onChange={(e) =>
                              setFilterArrangement(e.target.value)
                            }
                          >
                            <option value="recent">Most Recent</option>
                            <option value="older first">Oldest First</option>
                            <option value="a-z">A-Z</option>
                            <option value="z-a">Z-A</option>
                          </CSelect>
                        </CDropdownItem>
                        <CDropdownItem header>
                          <CLabel>Author</CLabel>
                          <Select
                            isMulti
                            value={filterAuthor}
                            options={authorOps}
                            className="d-block"
                            placeholder="Search by Author Name"
                            components={{
                              DropdownIndicator: () => null,
                              IndicatorSeparator: () => null,
                            }}
                            onChange={(event) => setFilterAuthor(event)}
                            openMenuOnClick={false}
                            noOptionsMessage={() =>
                              showDropdownAuthor ? "No Authors found" : null
                            }
                            onInputChange={(input) => {
                              if (isNotEmptyString(input)) {
                                setShowDropdownAuthor(true);
                                setAuthorOps((old) => {
                                  let filteredData = [];
                                  filteredData = authorOpsCopy.filter(
                                    (data) => {
                                      return (
                                        data.value
                                          ?.toLowerCase()
                                          ?.indexOf(input.toLowerCase()) >= 0
                                      );
                                    }
                                  );
                                  if (filteredData.length > 5) {
                                    const x = filteredData.slice(0, 5);
                                    filteredData = x;
                                  }
                                  return filteredData;
                                });
                              } else {
                                setShowDropdownAuthor(false);
                                setAuthorOps([]);
                              }
                            }}
                          />
                        </CDropdownItem>
                        <CDropdownItem header>
                          <CLabel>Section</CLabel>
                          <CSelect
                            custom
                            name="section"
                            value={filterSection?.section_id}
                            onChange={(e) =>
                              handleFilterSection(e.target.value)
                            }
                            className="section-select-list d-block font-12"
                          >
                            <option value="">Select a Section</option>
                            {sectionGrouped &&
                              sectionGrouped.map((section, index) => (
                                <React.Fragment>
                                  <option
                                    key={index}
                                    value={section.section_id}
                                  >
                                    {section.section_name}
                                  </option>
                                  {section.subsection?.length > 0 &&
                                    section.subsection?.map((sub, i) => (
                                      <option key={i} value={sub.section_id}>
                                        &nbsp;&nbsp;&nbsp;{sub.section}
                                      </option>
                                    ))}
                                </React.Fragment>
                              ))}
                            <option key="uncategorized" value={0}>
                              Uncategorized
                            </option>
                          </CSelect>
                        </CDropdownItem>
                        <CDropdownItem header>
                          <CLabel>Status</CLabel>
                          <CSelect
                            custom
                            name="status"
                            className="d-block font-12"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <option value="">Select Status</option>
                            <option value="1">Publish</option>
                            <option value="2">Publish Later</option>
                            <option value="0">Draft</option>
                            <option value="3">Disabled</option>
                          </CSelect>
                        </CDropdownItem>
                        <CDropdownItem header>
                          <CLabel>Article Tag</CLabel>
                          <Select
                            isMulti
                            value={filterTag}
                            options={tagOps}
                            className="d-block"
                            placeholder="Search by Article Tag"
                            components={{
                              DropdownIndicator: () => null,
                              IndicatorsContainer: () => null,
                              Option,
                              MultiValue,
                            }}
                            closeMenuOnSelect={false}
                            onChange={(event) => setFilterTag(event)}
                            openMenuOnClick={false}
                            noOptionsMessage={() =>
                              showDropdownTag ? "No Tags found" : null
                            }
                            onInputChange={(input) => {
                              if (isNotEmptyString(input)) {
                                setShowDropdownTag(true);
                                setTagOps((old) => {
                                  let filteredData = [];
                                  filteredData = tagOpsCopy.filter((data) => {
                                    return (
                                      data.value
                                        ?.toLowerCase()
                                        ?.indexOf(input.toLowerCase()) >= 0
                                    );
                                  });
                                  if (filteredData.length > 5) {
                                    const x = filteredData.slice(0, 5);
                                    filteredData = x;
                                  }
                                  return filteredData;
                                });
                              } else {
                                setShowDropdownTag(false);
                                setTagOps([]);
                              }
                            }}
                            styles={colourStyles}
                            hideSelectedOptions={false}
                          />
                        </CDropdownItem>
                        <CDropdownItem header>
                          <CRow>
                            <CCol>
                              <CButton
                                color="secondary w-100"
                                onClick={() => setShowFilter(false)}
                              >
                                Cancel
                              </CButton>
                            </CCol>
                            <CCol>
                              <CButton
                                className="mr-1 w-100"
                                onClick={() => handleApplyFilter()}
                                style={{
                                  backgroundColor: "#3F4C61",
                                  color: "#fff",
                                }}
                              >
                                Apply
                              </CButton>
                            </CCol>
                          </CRow>
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
                      No articles found. Change your search parameters and try
                      submitting again.
                    </p>
                  )
                }
                striped
                loading={isHandling}
                items={articleList}
                border
                fields={[
                  {
                    key: "article_id",
                    label: "#",
                    _style: { textAlign: "center" },
                  },
                  {
                    key: "title",
                    label: "TITLE",
                    sorter: true,
                    _style: { textAlign: "center", width: "40%" },
                  },
                  {
                    key: "section_name",
                    label: "SECTION",
                    _style: { textAlign: "center", width: "15%" },
                  },
                  {
                    key: "authors",
                    label: "AUTHOR",
                    _style: { textAlign: "center", width: "10%" },
                  },
                  {
                    key: "published_date",
                    label: "PUBLISHED",
                    _style: { width: "8%", textAlign: "center" },
                  },
                  {
                    key: "actions",
                    label: "ACTIONS",
                    _style: { width: "20%", textAlign: "center" },
                  },
                ]}
                hover
                itemsPerPage={
                  pagination
                    ? parseInt(pagination?.perPage)
                    : articleList?.length
                }
                pagination
                scopedSlots={{
                  actions: (item, index) => {
                    return (
                      <td
                        className={
                          item.status === 3
                            ? "article-disabled text-center"
                            : " text-center"
                        }
                      >
                        <div className="row m-0 btn-icons">
                          {/* <div className="col">
                            <CTooltip
                              advancedOptions={{
                                touch: false
                              }} content="Artcle Insights">
                              <CLink
                                onClick={() => toggleModal("insightsModal")}
                                disabled={
                                  item.locked_by ||
                                  item.auto_save === 1 ||
                                  item.status === 3
                                    ? true
                                    : false
                                }
                              >
                                <i className="material-icons tiny">
                                  signal_cellular_4_bar
                                </i>
                              </CLink>
                            </CTooltip>
                          </div> */}
                          <div className="col">
                            <CTooltip
                              advancedOptions={{
                                touch: false,
                              }}
                              content="Article History"
                            >
                              <CLink
                                onClick={() =>
                                  toggleModal("historyModal", item)
                                }
                                disabled={item.status === 3}
                              >
                                <i className="material-icons tiny">
                                  watch_later
                                </i>
                              </CLink>
                            </CTooltip>
                          </div>
                          <div className="col">
                            <CTooltip
                              advancedOptions={{
                                touch: false,
                              }}
                              content="Preview"
                            >
                              <CLink
                                onClick={() =>
                                  toggleModal("previewModal", item)
                                }
                                disabled={item.status === 3 || !isAllowedToView}
                              >
                                <i className="material-icons tiny">
                                  remove_red_eye
                                </i>
                              </CLink>
                            </CTooltip>
                          </div>
                          <div className="col">
                            <CTooltip
                              advancedOptions={{
                                touch: false,
                              }}
                              content="Disable"
                            >
                              <CLink
                                onClick={() =>
                                  toggleModal("disableModal", item)
                                }
                                disabled={
                                  isAllowedToDisable
                                    ? item.locked_by ||
                                      item.auto_save === 1 ||
                                      item.status === 3
                                      ? true
                                      : false
                                    : true
                                }
                              >
                                <i className="material-icons tiny">cancel</i>
                              </CLink>
                            </CTooltip>
                          </div>
                          {/* <div className="col">
                            <CTooltip
                              advancedOptions={{
                                touch: false
                              }} content="Push Notification">
                              <CLink
                                onClick={() => toggleModal("pushNotifModal")}
                                disabled={
                                  item.locked_by ||
                                  item.auto_save === 1 ||
                                  item.status === 3
                                    ? true
                                    : false
                                }
                              >
                                <i className="material-icons tiny">
                                  notifications
                                </i>
                              </CLink>
                            </CTooltip>
                          </div> */}
                        </div>
                      </td>
                    );
                  },
                  title: (item) => {
                    return (
                      <td
                        className={item.status === 3 ? "article-disabled" : ""}
                      >
                        {item.status === 1 && (
                          <i
                            className="material-icons text-info vertical-align-bottom"
                            style={{ fontSize: 18 }}
                          >
                            fiber_manual_record
                          </i>
                        )}
                        {item.status === 2 && (
                          <i
                            className="material-icons text-info vertical-align-bottom"
                            style={{ fontSize: 18 }}
                          >
                            adjust
                          </i>
                        )}
                        {item.status === 0 && (
                          <i
                            className="material-icons text-dark vertical-align-bottom"
                            style={{ fontSize: 18 }}
                          >
                            fiber_manual_record
                          </i>
                        )}
                        {item.status === 3 && (
                          <i
                            className="material-icons text-danger vertical-align-bottom"
                            style={{ fontSize: 18 }}
                          >
                            fiber_manual_record
                          </i>
                        )}
                        {renderTitle(item)}
                      </td>
                    );
                  },
                  section_name: (item) => renderSection(item),
                  article_id: (item) => (
                    <td className={item.status === 3 ? "article-disabled" : ""}>
                      {item.article_id}
                    </td>
                  ),
                  authors: (item) =>
                    item.locked_by || item.auto_save === 1 ? (
                      <td style={{ display: "none" }}></td>
                    ) : (
                      <td
                        className={
                          item.status === 3
                            ? "article-disabled text-center"
                            : "text-center"
                        }
                      >
                        {item.authors &&
                          item.authors.map((item) => item.author).join(", ")}
                      </td>
                    ),
                  published_date: (item) =>
                    item.locked_by || item.auto_save === 1 ? (
                      <td style={{ display: "none" }}></td>
                    ) : (
                      <td
                        className={
                          item.status === 3
                            ? "article-disabled text-center"
                            : "text-center"
                        }
                      >
                        {isNotEmptyString(item.published_date)
                          ? parseDate(
                              item.published_date,
                              "MMM DD,YYYY hh:mm a"
                            )
                          : item.published_date}
                      </td>
                    ),
                  fb_posts: (item) =>
                    item.locked_by || item.auto_save === 1 ? (
                      <td style={{ display: "none" }}></td>
                    ) : (
                      <td
                        className={
                          item.status === 3
                            ? "article-disabled text-center"
                            : "text-center"
                        }
                      >
                        {item.fb_posts}
                      </td>
                    ),
                  word_count: (item) =>
                    item.locked_by || item.auto_save === 1 ? (
                      <td style={{ display: "none" }}></td>
                    ) : (
                      <td
                        className={
                          item.status === 3
                            ? "article-disabled text-center"
                            : "text-center"
                        }
                      >
                        {item.word_count}
                      </td>
                    ),
                  seo_score: (item) => (
                    <td
                      className={
                        item.status === 3
                          ? "article-disabled text-center text-danger"
                          : "text-danger text-center"
                      }
                    >
                      {item.seo_score}
                    </td>
                  ),
                }}
              />
              {parseInt(total_rows) > 0 && (
                <CRow
                  style={{
                    marginTop:
                      articleList?.length > pagination?.perPage ? "-50px" : "0",
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
                      <div className="d-flex align-items-center">
                        <p className="mr-2 mb-0">Items per page</p>
                      </div>
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
      {disableModal.open && (
        <Modal
          show={disableModal.open}
          toggle={() => toggleModal("disableModal")}
          headerText="Are you sure you want to disable this article? You will no longer be able to publish this after it has been disabled."
          closeText="Cancel and go back to dashboard"
          callbackText="Continue and disable this article"
          onCallback={() => handleDisableArticle(disableModal.data)}
          buttonType="danger"
          size="lg"
          loading={isDisabling}
        >
          <div className="text-center">
            <h4>{disableModal.data?.title}</h4>
            <p>
              by{" "}
              <span className="secondary">
                {disableModal?.data?.authors
                  ?.map((author) => author.author)
                  ?.join(", ")}
              </span>
            </p>
          </div>
        </Modal>
      )}
      {pushNotifModal && (
        <Modal
          show={pushNotifModal}
          toggle={() => toggleModal("pushNotifModal")}
          headerText="Are you sure you want to push notification on this article?"
          closeText="Cancel and go back to dashboard"
          callbackText="Continue and push notification in this article"
          onCallback={() => console.log("ok")}
        >
          <div className="text-center">
            <h4>Cosmo sample title</h4>
            <p>
              by: <span className="secondary">Juan Dela Cruz</span>
            </p>
          </div>
        </Modal>
      )}
      {unlockModal.open && (
        <Modal
          size="lg"
          show={unlockModal.open}
          toggle={() => toggleModal("unlock")}
          headerText="Are you sure you want to unlock this article? An author is currently editing it."
          closeText="Cancel and go back to dashboard"
          callbackText="Continue and unlock this article"
          onCallback={() => handleUnlock(unlockModal.data)}
          buttonType="danger"
          loading={isLocking}
        >
          <div className="text-center">
            <h4>{unlockModal?.data?.title}</h4>
            <p>
              by{" "}
              <span className="secondary">
                {unlockModal?.data?.locked_by_name ||
                  unlockModal?.data?.auto_save_by_name}
              </span>
            </p>
          </div>
        </Modal>
      )}
      {historyModal.open && (
        <HistoryModal
          articleData={historyModal.data}
          historyModal={historyModal.open}
          toggleModal={toggleModal}
        />
      )}
      {previewModal.open && (
        <>
          <PreviewModal
            articleData={previewModal.data}
            previewModal={previewModal.open}
            toggleModal={toggleModal}
          />
        </>
      )}
      {insightsModal && (
        <ArticleInsightsModal
          data={insightsData}
          insightsModal={insightsModal}
          toggleModal={toggleModal}
        />
      )}
      {versionHistoryModal.open && (
        <VersionHistoryModal
          show={versionHistoryModal.open}
          onClose={() =>
            setVersionHistoryModal({
              open: false,
              data: {},
            })
          }
          article={versionHistoryModal.data}
        />
      )}
    </React.Fragment>
  );
};

export default Article;
