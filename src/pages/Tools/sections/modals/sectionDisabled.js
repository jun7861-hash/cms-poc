import React, { useState, useEffect } from "react";
// import { CButton, CSpinner, CRow, CCol, CTooltip, CLink } from "@coreui/react";
import { CButton, CSpinner, CTooltip, CLink, CSelect } from "@coreui/react";
import Select from "react-select";
import { useDispatch } from "react-redux";
import RightModal from "components/right-modal";
import TableGrid from "components/table-grid";
import Modal from "components/Modal";
import {
  setToDraft,
  setToUncategorized,
  reChannelArticles,
} from "core/services/article";
import { getSectionOps, getParentsGrouped } from "core/services/sections";
import { parseDate, isNotEmptyObject, isNotEmptyArray } from "core/helpers";
import PreviewModal from "components/preview-modal";
import * as masterActions from "store/master/actions";
import SetToDraftModal from "./setToDraftModal";
import SetToUncategorizedModal from "./setToUncategorizedModal";

const SectionDisabled = ({
  show,
  toggle,
  // sectionName,
  sectionId,
  handleSave,
  parentId,
  subSectionId,
  articleList,
  // pagination,
  filters,
  total_rows,
  // setPagination,
  setFilter,
  // setTotal_rows,
}) => {
  const dispatch = useDispatch();
  const [selectedMethod, setSelectedMethod] = useState({
    value: "reChannel",
    label: "Rechannel Articles",
  });
  // const [pagination, setPagination] = useState({
  //   current: 1,
  //   next: "",
  //   perPage: 2, //change to 30
  //   previous: 0,
  //   currentPageRows: "1 - 0",
  // });
  // eslint-disable-next-line
  const [isLoadingArticleList, setIsLoadingArticleList] = useState(false);
  const [sectionList, setSectionList] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [draftModal, setDraftModal] = useState(false);
  const [rechannelModal, setRechannelModal] = useState(false);
  const [confirmRechannel, setConfirmRechannel] = useState(false);
  const [uncategorizedModal, setUncategorizedModal] = useState(false);
  const [rechannelSection, setRechannelSection] = useState([]);
  const [rechannelDropdown, setRechannelDropdown] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [previewModal, setPreviewModal] = useState({
    open: false,
    data: {},
  });
  const [sectionGrouped, setSectionGrouped] = useState([]);

  /**
   * async function that fetches all section data.
   * getSectionOps - list of all sections
   * getParentsGrouped - sections grouped by parent sections
   * this is used for rechannel options.
   * current section is omitted
   */
  const getSectionOptions = async () => {
    setIsLoadingArticleList(true);
    const sections = await getSectionOps("");
    const parentSection = await getParentsGrouped("");
    const sectionList =
      sections &&
      sections.map((s) => ({
        value: s.section_id,
        label: s.section,
        section_id: s.section_id,
        section_name: s.section,
        url: s.url,
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
    let newList;
    if (parentId?.toString() === "0") {
      newList = grouped?.filter(
        (parent) => parent.section_id?.toString() !== sectionId?.toString()
      );
    } else {
      const getParentData = grouped?.filter(
        (parent) => parent.section_id?.toString() === parentId?.toString()
      );
      const newData = getParentData[0]?.subsection?.filter(
        (sub) => sub.section_id?.toString() !== sectionId?.toString()
      );
      let cloneData = grouped;
      cloneData?.filter((c) => {
        if (c.section_id?.toString() === parentId?.toString()) {
          return (c.subsection = newData);
        } else {
          return c;
        }
      });
      newList = cloneData;
    }
    setSectionGrouped(newList);
    setSectionList(sectionList);
    // const res = await getSectionsList("");
    // if (res.data) {
    //   const list = res.data?.filter(
    //     (a) =>
    //       a.section_id.toString() !== sectionId.toString() && a.status === 1
    //   );
    //   const sec = list.map((s) => {
    //     return {
    //       value: s.section_id,
    //       label: s.section,
    //       url: s.url,
    //     };
    //   });
    //   setSectionList(sec);
    // }
    setIsLoadingArticleList(false);
  };

  useEffect(() => {
    getSectionOptions();
  }, []); /*eslint-disable-line */

  //modal life cycles
  useEffect(() => {
    if (
      selectedMethod &&
      isNotEmptyObject(selectedMethod) &&
      selectedMethod.value === "set-to-draft"
    ) {
      setDraftModal(!draftModal);
    } else if (
      selectedMethod &&
      isNotEmptyObject(selectedMethod) &&
      selectedMethod.value === "uncategorized"
    ) {
      setUncategorizedModal(!uncategorizedModal);
    } // eslint-disable-next-line
  }, [selectedMethod]);

  /**
   * table columns
   */
  const columns = React.useMemo(
    () => [
      {
        Header: "ID",
        accessor: "article_id",
        width: "40px",
      },
      {
        Header: "Article Title",
        accessor: "title",
        width: "60%",
      },
      {
        Header: "Publish Date",
        accessor: "published_date",
        width: "80px",
        Cell: ({ cell }) => {
          const pub_date = parseDate(cell.value, "MM/DD/YYYY");
          return <span>{pub_date !== "Invalid date" ? pub_date : ""}</span>;
        },
      },
      {
        Header: "Preview",
        accessor: "preview",
        width: "10%",
        Cell: ({ cell }) => (
          <div className="text-center">
            <CTooltip
              advancedOptions={{
                touch: false,
              }}
              content="Preview"
            >
              <CLink
                onClick={() =>
                  setPreviewModal({
                    open: true,
                    data: cell.row.original,
                  })
                }
              >
                <i className="material-icons tiny">remove_red_eye</i>
              </CLink>
            </CTooltip>
          </div>
        ),
      },
    ],
    []
  );
  
  /**
   * list of all articles connected to the section
   */
  const tableData = React.useMemo(() => articleList, [articleList]);

  /**
   * Disabled section options
   */
  const options = [
    {
      value: "reChannel",
      label: "Rechannel Articles",
    },
    {
      value: "set-to-draft",
      label: "Set All Articles To Draft",
    },
    {
      value: "uncategorized",
      label: "Set All To Uncategorized",
    },
  ];

  /**
   * toggles the rechannel modal if selected articles is not 0
   */
  const handleContinue = () => {
    if (selectedRows.length > 0) {
      setRechannelModal(!rechannelModal);
    }
  };

  /**
   * handles setting all articles to draft
   */
  const handleSetAllToDraft = async () => {
    setIsSaving(true);
    const res = await setToDraft({
      section_id: [...subSectionId, sectionId?.toString()],
    });
    if (res.successful) {
      handleSave(
        true,
        "All articles were set back to draft",
        setDraftModal(false)
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
    setIsSaving(false);
  };

   /**
   * handles setting all articles to uncategorized
   */
  const handleSetAllToUncategorized = async () => {
    setIsSaving(true);
    const res = await setToUncategorized({
      section_id: [...subSectionId, sectionId?.toString()],
    });
    if (res.successful) {
      handleSave(
        true,
        "All articles were set to uncategorized",
        setDraftModal(false)
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
    setIsSaving(false);
  };

  /**
   * RECHANNEL ARTICLES
   * handles rechanneling from current section to other section
   */
  const handleReChannel = async () => {
    setIsSaving(true);
    try {
      const articleIds = selectedRows.map((item) => item.article_id.toString());
      const payload = {
        section_id: rechannelSection.value,
        section_name: rechannelSection.label,
        section_url: `/${rechannelSection.url}`,
        articles: articleIds,
      };
      const res = await reChannelArticles(payload);
      if (res.successful) {
        const responseMessage =
          selectedRows?.length === total_rows?.length
            ? `All articles were rechanneled`
            : `${selectedRows?.length} number of articles were rechanneled`;
        handleSave(true, responseMessage, setConfirmRechannel(false));
      } else {
        setConfirmRechannel(!confirmRechannel);
        dispatch(
          masterActions.updateNotificationModal({
            open: true,
            type: "error",
            bodyText: res.message,
          })
        );
      }
    } catch (error) {}
    setIsSaving(false);
  };

  /**
   * on-change handle of the rechannel section dropdown
   */
  const handleChangeSection = (id) => {
    if (id !== "") {
      setRechannelDropdown(id);
      const selectedSection = sectionList?.filter(
        (s) => s.section_id?.toString() === id?.toString()
      );
      setRechannelSection(selectedSection[0]);
    } else {
      setRechannelDropdown(id);
      setRechannelSection(null);
    }
  };

  return (
    <React.Fragment>
      <RightModal
        size="lg"
        show={show}
        onClose={() => toggle()}
        hasSaveButton={false}
        closeButton={true}
        closeOnBackdrop={false}
      >
        {isLoadingArticleList ? (
          <CSpinner color="secondary" className="sas" />
        ) : (
          <React.Fragment>
            <div className="mb-3">
              <Select
                value={selectedMethod}
                options={options}
                onChange={(selected) => setSelectedMethod(selected)}
                isSearchable={false}
              />
            </div>
            {selectedMethod &&
              isNotEmptyObject(selectedMethod) &&
              selectedMethod.value === "reChannel" && (
                <React.Fragment>
                  <p className="text-right font-weight-bold mb-2">
                    Total Number of Articles: {articleList?.length}
                  </p>
                  <TableGrid
                    columns={columns}
                    data={tableData}
                    loading={isLoadingArticleList}
                    setSelectedRows={setSelectedRows}
                    checkbox
                  />
                  {selectedMethod &&
                    isNotEmptyObject(selectedMethod) &&
                    selectedMethod.value === "reChannel" && (
                      <CButton
                        color="info"
                        className="float-right"
                        onClick={() => handleContinue()}
                        disabled={selectedRows.length === 0}
                      >
                        Continue
                      </CButton>
                    )}
                </React.Fragment>
              )}
          </React.Fragment>
        )}
      </RightModal>
      {previewModal.open && (
        <>
          <PreviewModal
            articleData={previewModal.data}
            previewModal={previewModal.open}
            toggleModal={() =>
              setPreviewModal({
                open: !previewModal.open,
                data: {},
              })
            }
          />
        </>
      )}
      {draftModal && (
        <SetToDraftModal
          show={draftModal}
          toggle={() => setDraftModal(!draftModal)}
          onCallback={() => handleSetAllToDraft()}
          isSaving={isSaving}
        />
      )}
      {uncategorizedModal && (
        <SetToUncategorizedModal
          show={uncategorizedModal}
          toggle={() => setUncategorizedModal(!uncategorizedModal)}
          onCallback={() => handleSetAllToUncategorized()}
          isSaving={isSaving}
        />
      )}
      {rechannelModal && (
        <Modal
          show={rechannelModal}
          toggle={() => setRechannelModal(!rechannelModal)}
          closeText="Cancel"
          callbackText="Continue"
          headerText="Rechannel all/selected articles to"
          onCallback={() => {
            setConfirmRechannel(!confirmRechannel);
            setRechannelModal(!rechannelModal);
          }}
          buttonType="info"
          closeOnBackdrop={false}
          disableCallBack={
            rechannelSection === null || rechannelSection?.length === 0
          }
        >
          {/* <Select
            value={rechannelSection}
            onChange={(selected) => setRechannelSection(selected)}
            isClearable
            isSearchable
            options={sectionList}
          /> */}
          <CSelect
            custom
            name="section"
            value={rechannelDropdown}
            onChange={(e) => handleChangeSection(e.target.value)}
            className="section-select"
          >
            <option value="">Select a Section</option>
            {sectionGrouped &&
              sectionGrouped.map((section, index) => (
                <React.Fragment>
                  <option key={index} value={section.section_id}>
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
          </CSelect>
        </Modal>
      )}
      {confirmRechannel && (
        <Modal
          show={confirmRechannel}
          toggle={() => setConfirmRechannel(!confirmRechannel)}
          closeText="Cancel"
          callbackText="Continue"
          headerText="Are you sure you want to rechannel articles to this section?"
          onCallback={() => handleReChannel()}
          buttonType="info"
          loading={isSaving}
          closeOnBackdrop={false}
        >
          <h3 className="text-center">{rechannelSection?.label}</h3>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default SectionDisabled;
