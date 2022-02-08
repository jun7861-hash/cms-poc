import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import OutsideClickHandler from "react-outside-click-handler";
import {
  CHeader,
  CToggler,
  CHeaderNav,
  CButton,
  CDropdownItem,
  CCol,
  CRow,
  CSpinner,
} from "@coreui/react";
import DateTimePicker from "components/date-time-picker";
import { TheHeaderDropdown } from "containers/index";
import { parseDate, isNotEmptyString } from "core/helpers";
import * as masterActions from "store/master/actions";
import arrowLeft from "assets/icons/arrow-left.svg";
// import * as userActions from '../store/user/actions'
// import * as toolsActions from 'store/tools/actions'

const TheHeader = ({
  exitArticle,
  handleExitArticle,
  loadingExit,
  isEdit,
  articleTitle,
  toggleSaveButton,
  togglePublish,
  toggleDisable,
  toggleDraft,
  isSaving,
  status,
  togglePublishLater,
  savingText,
  isValidAllFields,
  publishLaterDate,
  isAllowedToPublished,
  isAllowedToEdit,
  isLocked,
  isHandlingAutoSave,
  isAllowedToDisable,
  articleStatus,
  togglePreview,
  isAllowedToView,
  isEqual,
}) => {
  //publish later date picker
  const [publishDate, setPublishDate] = useState(new Date());
  //status dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const dispatch = useDispatch();
  const master = useSelector((state) => state.master);

  //sidebar toggler web view (burger icon)
  const toggleSidebar = () => {
    dispatch(masterActions.toggleSidebar(!master.sidebar));
  };

  //sidebar toggler mobile view (burger icon)
  const toggleSidebarMobile = () => {
    const val = [false, "responsive"].includes(master.sidebar)
      ? true
      : "responsive";
    dispatch(masterActions.toggleSidebar(val));
  };

  /**
   * handles publish later button
   * parsing the date to format YYYY-MM-DD HH:mm:ss
   * if date is empty prompt an alert message
   */
  const handlePublishLater = () => {
    if (publishDate) {
      togglePublishLater(parseDate(publishDate, "YYYY-MM-DD HH:mm:ss"));
    } else {
      alert(`Please select a date for "Publish Later."`);
    }
  };

  useEffect(() => {
    /**
     * appending publish later date if status === 2 (publish later)
     * parsing string into date format
     */
    if (status === "2" && isNotEmptyString(publishLaterDate)) {
      const newDate = parseDate(publishLaterDate, "MM/DD/YYYY hh:mm a");
      setPublishDate(new Date(newDate));
    } else {
      setPublishDate(new Date());
    }
  }, [status, publishLaterDate]); /*eslint-disable-line*/

  return (
    <CHeader withSubheader>
      <div className="mr-auto d-flex align-items-center">
        <CToggler
          inHeader
          className="ml-md-3 d-lg-none float-left px-2 pt-3"
          onClick={toggleSidebarMobile}
        />
        <CToggler
          inHeader
          className="ml-1 d-md-down-none float-left"
          onClick={toggleSidebar}
          style={{ padding: "0.75rem 1rem" }}
        />
        {isEdit && (
          <>
            {/* <CButton
              color="danger"
              className="d-none-sp my-2 px-4"
              onClick={() => handleExitArticle()}
              disabled={isSaving}
            >
              Exit
              {loadingExit && <CSpinner color="secondary ml-2" size="sm" />}
            </CButton> */}
            <img
              className="d-none d-lg-block"
              onClick={() => handleExitArticle()}
              disabled={isSaving}
              src={arrowLeft}
              alt="back"
              width="18px"
              style={{ cursor: "pointer" }}
            />
          </>
        )}
      </div>

      {!isLocked ? (
        <CHeaderNav className="px-1 d-flex justify-content-end justify-content-sp-space-between px-sm-3 w-auto w-100-sp">
          {/* <CButton
            className="d-flex mx-1"
            color="info"
            onClick={() =>
              dispatch(masterActions.updateSEOScoreModal(true, null))
          }
          >
            Check SEO Score
          </CButton> */}
          {/* {isEdit && (
            <CButton
              color="danger"
              className="d-block-sp d-none my-2 px-4"
              onClick={() => handleExitArticle()}
              disabled={isSaving}
            >
              Exit
              {loadingExit && <CSpinner color="secondary ml-2" size="sm" />}
            </CButton>
          )} */}

          <div className="d-flex align-items-center">
            {isEdit && (
              <>
                <p
                  className="m-0 p-2 d-lg-none"
                  onClick={() => handleExitArticle()}
                  disabled={isSaving}
                  style={{ cursor: "pointer" }}
                >
                  <img src={arrowLeft} alt="back" width="18px" />
                </p>
                {/* <CLink
                onClick={() => togglePreview()}
                disabled={!isAllowedToView}
                className="mx-2 preview-icon d-flex align-items-center"
              >
                <i className="material-icons tiny mr-1 text-dark v-align-bottom">
                  remove_red_eye
                </i>
                <span className="text-dark font-weight-bold v-align-middle">
                  Preview
                </span>
              </CLink> */}
              </>
            )}
          </div>
          <div className="d-flex custom-margin-right1 align-items-center">
            {(isSaving || isHandlingAutoSave) && (
              <CSpinner size="md" color="secondary" className="mr-2" />
            )}
            {/* status dropdown */}
            <CButton
              onClick={() => togglePreview()}
              disabled={!isAllowedToView}
              className="preview-icon d-flex align-items-center"
              color="secondary"
              variant="outline"
              style={{ color: "#8E95A2" }}
            >
              <i className="material-icons tiny mr-2 v-align-bottom">
                remove_red_eye
              </i>
              <span className="font-weight-bold v-align-middle">Preview</span>
            </CButton>
            <div className="position-relative ml-2">
              <OutsideClickHandler
                onOutsideClick={() => {
                  showDropdown && setShowDropdown(false);
                }}
              >
                {articleStatus?.toString() === "1" ? (
                  <CButton
                    onClick={() => setShowDropdown(!showDropdown)}
                    color="info"
                    className="d-flex align-items-center"
                    disabled={
                      isAllowedToEdit ||
                      isAllowedToDisable ||
                      isAllowedToPublished
                        ? isHandlingAutoSave
                          ? true
                          : !isValidAllFields
                        : true
                    }
                  >
                    <span>Publish</span>{" "}
                    <span
                      class="material-icons"
                      style={{ fontSize: "20px", margin: "0 -6px 0 -3px" }}
                    >
                      arrow_drop_down
                    </span>
                  </CButton>
                ) : articleStatus?.toString() === "2" ? (
                  <CButton
                    onClick={() => setShowDropdown(!showDropdown)}
                    color="info"
                    className="px-4 d-flex align-items-center"
                    disabled={
                      isAllowedToEdit ||
                      isAllowedToDisable ||
                      isAllowedToPublished
                        ? isHandlingAutoSave
                          ? true
                          : !isValidAllFields
                        : true
                    }
                    variant="outline"
                  >
                    <span>Later</span>{" "}
                    <span
                      class="material-icons"
                      style={{ fontSize: "20px", margin: "0 -6px 0 -3px" }}
                    >
                      arrow_drop_down
                    </span>
                  </CButton>
                ) : (
                  <CButton
                    onClick={() => setShowDropdown(!showDropdown)}
                    color="secondary"
                    className="px-4 d-flex align-items-center"
                    style={{
                      backgroundColor: showDropdown ? "#b2b8c1" : "#f0f0f0",
                    }}
                    disabled={
                      isEdit
                        ? isAllowedToEdit ||
                          isAllowedToDisable ||
                          isAllowedToPublished
                          ? isHandlingAutoSave
                            ? true
                            : !isValidAllFields
                          : true
                        : isHandlingAutoSave
                        ? true
                        : isValidAllFields
                        ? false
                        : true
                    }
                  >
                    <span>Draft</span>{" "}
                    <span
                      class="material-icons"
                      style={{ fontSize: "20px", margin: "0 -6px 0 -3px" }}
                    >
                      arrow_drop_down
                    </span>
                  </CButton>
                )}
                <div
                  className={`_dropdownmenu-custom ${
                    showDropdown ? "show" : ""
                  }`}
                >
                  <CRow style={{ padding: ".5rem 1.25rem" }}>
                    <CCol lg="8 text-dark">
                      <p
                        className="mb-0 font-weight-bold"
                        style={{ fontSize: ".76562rem" }}
                      >
                        Set as Draft
                      </p>
                      <p className="mb-0" style={{ fontSize: ".76562rem" }}>
                        Content not visible on live site
                      </p>
                    </CCol>
                    <CCol lg="4">
                      <CButton
                        className="w-100"
                        color="secondary"
                        onClick={() => toggleDraft()}
                        disabled={isEdit ? isSaving || !isAllowedToEdit : false}
                      >
                        Draft
                      </CButton>
                    </CCol>
                  </CRow>
                  <React.Fragment>
                    {isAllowedToPublished &&
                      (status === "0" || status === "2") && (
                        <React.Fragment>
                          <CDropdownItem divider />
                          <CRow
                            style={{
                              padding: "10px 15px",
                              fontSize: "12.2499px",
                            }}
                          >
                            <CCol lg="8 text-dark">
                              {status === "2" ? (
                                <p className="mb-1">
                                  Publish On:{" "}
                                  <span className="text-warning">
                                    {parseDate(
                                      publishLaterDate,
                                      "MMM DD, YYYY hh:mm"
                                    )}
                                  </span>
                                </p>
                              ) : (
                                <React.Fragment>
                                  <p
                                    className="mb-0 font-weight-bold"
                                    style={{ fontSize: ".76562rem" }}
                                  >
                                    Publish
                                  </p>
                                  <p
                                    className="mb-1"
                                    style={{ fontSize: ".76562rem" }}
                                  >
                                    Push your content on live site
                                  </p>
                                </React.Fragment>
                              )}
                              <div className="mb-2 w-auto w-100-sp">
                                <DateTimePicker
                                  date={publishDate}
                                  setDate={(date) => setPublishDate(date)}
                                  className="p-1 border border-secondary rounded"
                                  timeLabel="Time: "
                                  timeFormat="yyyy/MM/dd h:mm aa"
                                />
                              </div>
                            </CCol>

                            <CCol lg="4">
                              <CButton
                                className="d-block mb-2 w-100 px-0"
                                color="info"
                                onClick={() => togglePublish("publish_now")}
                                disabled={isSaving}
                              >
                                Publish Now
                              </CButton>
                              <CButton
                                className="d-block w-100 px-0"
                                color="info"
                                variant="outline"
                                onClick={() => handlePublishLater()}
                                disabled={isSaving}
                              >
                                Publish Later
                              </CButton>
                            </CCol>
                          </CRow>
                        </React.Fragment>
                      )}
                    {isEdit && isAllowedToDisable && (
                      <React.Fragment>
                        <CDropdownItem divider />
                        <CDropdownItem
                          header
                          className="my-0 m-0"
                          style={{ cursor: "default" }}
                        >
                          <CRow>
                            <CCol lg="8 text-dark">
                              <p
                                className="mb-0 font-weight-bold"
                                style={{ fontSize: ".76562rem" }}
                              >
                                Disable Entry
                              </p>
                              <p
                                className="mb-1"
                                style={{ fontSize: ".76562rem" }}
                              >
                                Content no longer be accessed
                              </p>
                            </CCol>
                            <CCol lg="4">
                              <CButton
                                className="d-block mb-2 w-100"
                                color="danger"
                                onClick={() => toggleDisable()}
                                disabled={isSaving}
                              >
                                Disable
                              </CButton>
                            </CCol>
                          </CRow>
                        </CDropdownItem>
                      </React.Fragment>
                    )}
                  </React.Fragment>
                </div>
              </OutsideClickHandler>
            </div>
            {/* <DropdownNotif /> */}
            {isNotEmptyString(savingText) && (
              <i className="mx-2">{savingText}</i>
            )}
            {isEdit && !isNotEmptyString(savingText) && (
              <CButton
                className="d-flex ml-2 px-4"
                color="info"
                onClick={() => toggleSaveButton()}
                disabled={
                  (isEqual && isEdit) ||
                  isSaving ||
                  !isValidAllFields ||
                  !isAllowedToEdit
                }
              >
                Save
              </CButton>
            )}
          </div>
          {/* <CButton
          className="mx-1"
          variant="ghost"
          color="secondary"
          onClick={() =>
            dispatch(masterActions.updateSyndicateModal(true, null))
          }
        >
          Syndicate
        </CButton> */}

          {/* <TheHeaderDropdown /> */}
        </CHeaderNav>
      ) : (
        <CHeaderNav className="px-1 d-flex justify-content-end px-sm-3 w-auto w-100-sp">
          <TheHeaderDropdown />
        </CHeaderNav>
      )}
    </CHeader>
  );
};

export default TheHeader;
