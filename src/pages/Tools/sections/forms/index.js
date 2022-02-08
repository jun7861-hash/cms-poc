import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  CLabel,
  CRow,
  CCol,
  CInput,
  CButton,
  CSwitch,
  CCard,
  CSpinner,
  CCardBody,
  CCardHeader,
} from "@coreui/react";
import { useDispatch, useSelector } from "react-redux";
import {
  isNotEmptyArray,
  isNotEmptyObject,
  isNotEmptyString,
  formatSlug,
} from "core/helpers";
import {
  getParentSections,
  getSectionsById,
  createSection,
  updateSection,
  getSectionsList,
  validateSectionName,
} from "core/services/sections";
import { getArticlesBySection } from "core/services/article";
import * as masterActions from "store/master/actions";
import Modal from "components/Modal";
import DisableModal from "../modals/disableModal";
import ReChannel from "../modals/reChannel";
import SectionDisabled from "../modals/sectionDisabled";
import * as actionTools from "store/tools/actions";
// import ViewArticlesModal from "../modals/viewArticles";

const SectionForm = ({ match }) => {
  const dispatch = useDispatch();
  const breadCrumbs = useSelector((state) => state.tools.breadCrumbs);
  const sectionsList = useSelector((state) => state.tools.sectionsList);
  const userPermissions = useSelector((state) => state.master.userPermissions);
  // const isAllowedToCreate = userPermissions.includes("Section.Create");
  const isAllowedToEdit = userPermissions.includes("Section.Edit");
  const isAllowedToDisable = userPermissions.includes("Section.Disable");
  const isEdit = match.params.id;
  const [disableSectionModal, setDisableSectionModal] = useState(false);
  const [sectionDisabledModal, setSectionDisabledModal] = useState(false);
  const [reChannelModal, setReChannelModal] = useState(false);
  // const [viewArticlesModal, setViewArticlesModal] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [parentsectionOps, setParentSectionOps] = useState([]);
  // eslint-disable-next-line
  const [isHandlingSave, setIsHandlingSave] = useState(false);
  const [nameExist, setNameExist] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState({
    open: false,
    data: {},
  });
  const [data, setData] = useState({
    section_id: "",
    parent_id: "",
    section: "",
    sub_section: "",
    description: "",
    slug: "",
    url: "",
    status: 1,
    created_at: "",
    updated_at: "",
    parent_section: "",
  });
  //initial section status
  const [pStatus, setPStatus] = useState("");
  //states for all subsections id (if parent)
  const [subSectionId, setSubSectionId] = useState([]);
  //list of all article intact with specific section
  const [articleList, setArticleList] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    next: "",
    perPage: 30,
    previous: 0,
    currentPageRows: "1 - 0",
  });
  const [filters, setFilter] = useState({
    limit: 1,
    page: 1,
  });
  const [total_rows, setTotal_rows] = useState(0);

  /**
   * updates the section form state
   */
  const handleChange = (type, value) => {
    setData({
      ...data,
      [type]: value,
    });
  };

  /**
   * get section by id
   */
  const loadData = async () => {
    setIsLoading(true);
    dispatch(
      actionTools?.updateBreadCrumbs({
        ...breadCrumbs,
        section: "",
      })
    );
    //api call
    const sectionData = await getSectionsById(match.params.id);
    if (sectionData && isNotEmptyObject(sectionData)) {
      const parent = {
        value: sectionData.section_id,
        label: sectionData.parent_section,
        parentSection: sectionData.section_id,
      };
      let subIds;
      if (sectionData.sub_sections?.length > 0) {
        const sub_ids = sectionData.sub_sections?.map((item) =>
          item.section_id.toString()
        );
        subIds = sub_ids;
        setSubSectionId(sub_ids);
      }
      dispatch(
        actionTools?.updateBreadCrumbs({
          ...breadCrumbs,
          section: sectionData.section,
        })
      );
      setPStatus(sectionData.status);
      setData({ ...sectionData, parent_section: parent });
      await getArticlesinSection(
        sectionData.parent_id,
        sectionData.section_id,
        true,
        subIds
      );
      !isEdit && setIsLoading(false);
    }
  };

  /**
   * async function that fetches all articles connected with the current section
   * @param {number} parentId - parent ID of the section
   * @param {number} sectionId - sectiond id
   * @param {boolean} isLoad - loading indication
   * @param {array} subIds - sub ids (if parent section)
   */
  const getArticlesinSection = async (parentId, sectionId, isLoad, subIds) => {
    isLoad && setIsLoading(true);
    let payload;
    //check if section is parent id
    if (parentId === 0) {
      if (subIds && subIds !== null) {
        payload = [sectionId?.toString(), ...subIds];
      } else {
        payload = [sectionId?.toString()];
      }
    } else {
      payload = [sectionId?.toString()];
    }
    //api call
    const res = await getArticlesBySection({
      limit: "100000",
      page: "1",
      // limit: filters.limit.toString(),
      // page: filters.page.toString(),
      section_id: payload,
    });
    //set to state
    setArticleList(res?.data);
    setTotal_rows(res?.data);
    // if (res) {
    //   if (res.pagination) {
    //     setPagination(res.pagination);
    //     setFilter({
    //       ...filters,
    //       limit: res.pagination.perPage,
    //       page: res.pagination.current,
    //     });
    //   } else {
    //     setPagination({
    //       current: 1,
    //       next: "",
    //       perPage: filters.limit,
    //       previous: 0,
    //       currentPageRows: `1 - ${res.total_rows}`,
    //     });
    //   }
    //   setTotal_rows(res.total_rows);
    //   setArticleList(res.data);
    // }
    isLoad && setIsLoading(false);
  };

  /**
   * async function that fetches all section data.
   */
  const loadSectionList = async () => {
    setIsLoading(true);
    await getSectionsList("");
    setIsLoading(false);
  };

  /**
   * async function that fetches all PARENT sections.
   */
  const loadParentSections = async () => {
    setIsLoading(true);
    const sections = await getParentSections();
    if (isNotEmptyArray(sections)) {
      const sectionOptions = sections
        ?.filter((item) => item.status !== 0)
        ?.map((s) => {
          return {
            value: s.section_id,
            label: s.section,
            slug: s.slug,
            parentSection: s.section_id,
            url: s.url,
          };
        });
      setParentSectionOps(sectionOptions);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadParentSections();
    !isNotEmptyArray(sectionsList) && loadSectionList();
    if (isEdit) {
      loadData();
    } else {
      dispatch(
        actionTools?.updateBreadCrumbs({
          ...breadCrumbs,
          section: "",
        })
      );
    }
  }, []); /*eslint-disable-line*/

  // useEffect(() => {
  //   if (data.section_id !== "") {
  //     getArticlesinSection(data?.parent_id, data?.section_id, false);
  //   }
  // // }, [filters?.limit, filters?.page]); /*eslint-disable-line*/

  /**
   * validation of section name of already exist
   */
  const checkName = async () => {
    if (data && isNotEmptyString(data?.section)) {
      if (data?.section?.toLocaleLowerCase().trim() === "uncategorized") {
        setNameExist(true);
        return false;
      } else {
        const parentId =
          data?.parent_section === "" || data?.parent_section === null
            ? 0
            : data?.parent_section?.value;
        const isExist = await validateSectionName(
          encodeURIComponent(data?.section),
          parentId
        );
        if (isExist?.data?.length > 0) {
          if (
            match.params.id &&
            isExist?.data[0]?.section_id?.toString() ===
              match.params.id?.toString()
          ) {
            setNameExist(false);
            return true;
          } else {
            setNameExist(true);
            return false;
          }
        } else {
          setNameExist(false);
          return true;
        }
      }
    } else {
      return false;
    }
  };

  /**
   * validate all fields in section form
   */
  const validate = async () => {
    setIsHandlingSave(true);
    const { section } = data;
    const checkSectionName = await checkName();
    if (isNotEmptyString(section) && checkSectionName) {
      if (articleList?.length > 0) {
        handleSave();
      } else {
        setConfirmationModal({
          open: true,
          data: section,
        });
      }
    } else {
      setInvalid(true);
    }
    setIsHandlingSave(false);
  };

  /**
   * handles creating / updating a section
   */
  const handleSave = async (canDisable, responseMessage, closeModal) => {
    const { description, section, slug, status, url, parent_section } = data;
    //checking if is in edit form
    if (match.params.id) {
      /**
       * check if user wants to disable a section
       * check if previous status is active then if current state is inactive
       * if there is an article connected with the section display the disable modal
       */
      if (
        !canDisable &&
        articleList?.length > 0 &&
        pStatus === 1 &&
        status === 0
      ) {
        setDisableSectionModal(!disableSectionModal);
      } else {
        try {
          setIsHandlingSave(true);
          const _data = {
            section: section,
            description: description,
            status: status.toString(),
          };
          const res = await updateSection(_data, match.params.id);
          if (res?.successful) {
            closeModal && closeModal();
            responseMessage && setSectionDisabledModal(false);
            setDisableSectionModal(false);
            setConfirmationModal(!confirmationModal.open);
            dispatch(
              masterActions.updateNotificationModal({
                open: true,
                type: "success",
                bodyText: responseMessage || res.message,
                callback: async (closeModal) => {
                  closeModal();
                  window.location.href = `/tools/sectionForm/${match.params.id}`;
                },
              })
            );
          } else {
            setConfirmationModal(!confirmationModal.open);
            dispatch(
              masterActions.updateNotificationModal({
                open: true,
                type: "error",
                bodyText: res?.message,
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
        setIsHandlingSave(false);
      }
    } else {
      try {
        setIsHandlingSave(true);
        const _data = {
          section: section,
          description: description,
          parent_id:
            isNotEmptyObject(parent_section) || isNotEmptyObject(parent_section)
              ? parent_section.parentSection.toString()
              : "0",
          slug: slug,
          status: status,
          url: url,
        };
        const res = await createSection(_data);
        if (res.successful) {
          console.log(res);
          setConfirmationModal(!confirmationModal.open);
          dispatch(
            masterActions.updateNotificationModal({
              open: true,
              type: "success",
              bodyText: res.message,
              callback: async (closeModal) => {
                closeModal();
                window.location.href = `/tools/sectionForm/${res.data.id}`;
              },
            })
          );
        } else {
          setConfirmationModal(!confirmationModal.open);
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
      setIsHandlingSave(false);
    }
  };

  useEffect(() => {
    !isEdit && handleChange("slug", formatSlug(data?.section));
  }, [data?.section]); /*eslint-disable-line*/

  /**
   * generating url every changes of parent section and slug
   */
  useEffect(() => {
    if (!isEdit || isEdit === null || isEdit === undefined) {
      const url =
        isNotEmptyArray(data?.parent_section) ||
        isNotEmptyObject(data?.parent_section)
          ? `${data?.parent_section.url?.toLowerCase()}/${data?.slug}`
          : `${data?.slug}`;
      handleChange("url", url);
    }
  }, [isEdit, data?.parent_section, data?.slug]); /*eslint-disable-line*/

  /**
   * checking user permission to disable fields
   */
  const disableFields = () => {
    if (isEdit) {
      if (isAllowedToEdit) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };
  
  /**
   * checking user permission to disable save button
   */
  const disableSave = () => {
    if (isEdit) {
      if (isAllowedToEdit) {
        return false;
      } else if (isAllowedToDisable) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  };

  return (
    <React.Fragment>
      {isLoading ? (
        <CSpinner color="secondary" size="lg" className="screen-loading" />
      ) : (
        <CCard className="p-2">
          <CCardHeader>
            <h5 className="mb-0 float-left pt-2">Section Form</h5>
            <CButton
              className="d-flex mx-2 float-right"
              size="md"
              color="info"
              onClick={() => validate()}
              disabled={disableSave()}
            >
              Save
              {isHandlingSave && <CSpinner size="sm" color="secondary ml-2" />}
            </CButton>
            {isEdit && pStatus.toString() === "0" && articleList?.length > 0 && (
              <CButton
                color="info"
                className="float-right"
                onClick={() => setSectionDisabledModal(!sectionDisabledModal)}
                disabled={disableFields()}
              >
                View Articles
              </CButton>
            )}
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol lg="2" className="mb-3">
                <CLabel>Section Name</CLabel>
              </CCol>
              <CCol lg="5" className="mb-3">
                <CInput
                  invalid={invalid && !isNotEmptyString(data?.section)}
                  type="text"
                  className="text-dark"
                  value={data?.section}
                  onChange={(e) => handleChange("section", e.target.value)}
                  disabled={disableFields()}
                />
                {invalid && !isNotEmptyString(data?.section) && (
                  <p className="text-danger small">This field is required.</p>
                )}
                {isNotEmptyString(data?.section) && nameExist && (
                  <p className="text-danger small">
                    {" "}
                    Sorry, that section name is already taken. Please provide
                    another one.{" "}
                  </p>
                )}
              </CCol>
            </CRow>
            <CRow>
              <CCol lg="2" className="mb-3">
                <CLabel>Parent Section</CLabel>
              </CCol>
              <CCol lg="5" className="mb-3">
                <Select
                  isClearable
                  isSearchable
                  value={data?.parent_section}
                  onChange={(value) => handleChange("parent_section", value)}
                  options={parentsectionOps}
                  placeholder="Select Parent Section"
                  isDisabled={isEdit}
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol lg="2" className="mb-3">
                <CLabel>Section URL</CLabel>
              </CCol>
              <CCol lg="5" className="mb-3">
                <CInput
                  type="text"
                  className="text-dark"
                  value={data?.url}
                  readOnly
                  disabled
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol lg="2" className="mb-3">
                <CLabel>Slug</CLabel>
              </CCol>
              <CCol lg="5" className="mb-3">
                <CInput
                  type="text"
                  className="text-dark"
                  value={data?.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  disabled
                  readOnly
                />
              </CCol>
            </CRow>
            <CRow>
              <CCol lg="2" className="mb-3">
                <CLabel>Description</CLabel>
              </CCol>
              <CCol lg="5" className="mb-3">
                <CInput
                  type="text"
                  className="text-dark"
                  value={data?.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  disabled={disableFields()}
                />
                <small>
                  <i className="material-icons text-secondary mt-2 v-align-bottom pr-1">
                    info
                  </i>
                  Provide a short summary of what visitors should expect to read
                  in your channel. This is displayed on search engine results
                  pages.
                </small>
              </CCol>
            </CRow>
            <CRow>
              <CCol lg="2">
                <CLabel>Status</CLabel>
              </CCol>
              <CCol lg="5">
                <CSwitch
                  disabled={isEdit ? !isAllowedToDisable : false}
                  checked={data?.status === 1 ? true : false}
                  size="lg"
                  color="success"
                  onChange={(e) =>
                    handleChange("status", data?.status === 1 ? 0 : 1)
                  }
                  labelOff="Inactive"
                  labelOn="Active"
                  className={`cusEl ${
                    data?.status === 1 ? "active" : "inactive"
                  }`}
                />
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}
      {/* disable modal confirmation */}
      {disableSectionModal && (
        <DisableModal
          show={disableSectionModal}
          toggle={() => setDisableSectionModal(!disableSectionModal)}
          onCallback={() => {
            setSectionDisabledModal(!sectionDisabledModal);
          }}
        />
      )}
      {/* disable modal */}
      {sectionDisabledModal && (
        <SectionDisabled
          show={sectionDisabledModal}
          toggle={() => setSectionDisabledModal(!sectionDisabledModal)}
          toggleRechannelModal={() => setReChannelModal(!reChannelModal)}
          sectionName={data?.section}
          sectionId={data?.section_id}
          parentId={data?.parent_id}
          subSectionId={subSectionId}
          articleList={articleList}
          handleSave={(canDisable, responseMessage, closeModal) =>
            handleSave(canDisable, responseMessage, closeModal)
          }
          pagination={pagination}
          filters={filters}
          total_rows={total_rows}
          setPagination={(data) => setPagination(data)}
          setFilter={(data) => setFilter(data)}
          setTotal_rows={(data) => setTotal_rows(data)}
        />
      )}
      {/* rechannel modal */}
      {reChannelModal && (
        <ReChannel
          show={reChannelModal}
          toggle={() => setReChannelModal(!reChannelModal)}
          sectionId={data?.section_id}
        />
      )}
      {/* view articles modal */}
      {/* {viewArticlesModal && (
        <ViewArticlesModal
          show={viewArticlesModal}
          toggle={() => setViewArticlesModal(!viewArticlesModal)}
          sectionId={data?.section_id}
          articlesBySectionId={articlesBySectionId}
        />
      )} */}
      {/* confirmation modal */}
      {confirmationModal.open && (
        <Modal
          loading={isHandlingSave}
          show={confirmationModal.open}
          toggle={() => setConfirmationModal(!confirmationModal.open)}
          headerText={
            match.params.id
              ? `Are you sure to update this section?`
              : `Are you sure to create this section?`
          }
          closeText="Cancel"
          callbackText="Continue"
          onCallback={() => handleSave()}
          buttonType="info"
        >
          <div className="text-center">
            <h4>{confirmationModal.data}</h4>
          </div>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default SectionForm;
