import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useDispatch, useSelector } from "react-redux";
import Select, { components } from "react-select";
import CreatableSelect from "react-select/creatable";
import _ from "lodash";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import PulseLoader from "react-spinners/PulseLoader";
import {
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CRow,
  CInput,
  CFormText,
  CInputGroup,
  CInputGroupText,
  CInputGroupPrepend,
  CButton,
  CSwitch,
  CTextarea,
  CSpinner,
  CAlert,
  CLink,
  CSelect,
} from "@coreui/react";
import {
  getArticleById,
  addArticle,
  getAllUserByAuthors,
  editArticle,
  checkTitle,
  postTagOptionsCount,
  lockUnlockArticle,
} from "core/services/article";
import {
  isNotEmptyArray,
  isNotEmptyObject,
  isNotEmptyString,
  parseDate,
  formatSlug,
  appendLfrm,
  countWords,
  removeSaveNotifId,
} from "core/helpers";
import {
  getSectionOps,
  checkIfSectionIsActive,
  getParentsGrouped,
} from "core/services/sections";
import { getAllImage } from "core/services/image_library";
import { getTagOps, addTag, checkIfTagsIsDisabled } from "core/services/tags";
import * as masterActions from "store/master/actions";
import ImageLibraryModal from "components/image-library-modal";
import PreviewModal from "components/preview-modal";
import TheFooter from "containers/Footer";
import Header from "../header";

//domain placeholder in URL field
const domain = "http://staging.v1.cosmo.ph";
const CreateArticle = ({ match }) => {
  //used for tags (count)
  const { Option } = components;
  const IconOption = (props) => (
    <Option {...props}>
      {props.data.label}
      <span style={{ float: "right" }}>{props.data.count}</span>
    </Option>
  );

  const dispatch = useDispatch();
  const imageList = useSelector((state) => state.master.imageList);
  const currentUser = useSelector((state) => state.master.currentUser);
  const sendJsonMessage = useSelector(
    (state) => state.master.notificationService
  );
  const userPermissions = useSelector((state) => state.master.userPermissions);
  const isEdit = match?.params?.id;

  //user permissions
  const isAllowedToPublished = userPermissions.includes("Article.Publish");
  const isAllowedToEdit = userPermissions.includes("Article.Edit");
  const isAllowedToEditSlug = userPermissions.includes("Article.Change_Slug");
  const isAllowedToDisable = userPermissions.includes("Article.Disable");
  const isAllowedToView = userPermissions.includes("Article.View");
  const isAllowedToViewImageList =
    userPermissions.includes("ImageLibrary.List");
  const isAllowedToEditSection = userPermissions.includes(
    "Article.Change_Section"
  );
  const isAllowedToCreateTag = userPermissions.includes("Tag.Create");

  //handling state (loading icon)
  const [isArticleHandling, setIsArticleHandling] = useState(false);
  //article state
  const [articleState, setArticleState] = useState({
    sections: [],
    authors: [],
    title: "",
    slug: "",
    url: {
      domain: "",
      section_url: "",
      slug: "",
    },
    blurb: "",
    body_content: "",
    display_author: 0,
    image_path: "",
    image_id: "",
    published_date: "",
    status: 0,
    tags: [],
    display_image: 0,
  });
  //article state initial data CLONE used for comparing if user has made changes in the article
  const [articleStateBaseClone, setArticleStateBaseClone] = useState({});
  //article initial status
  const [articleStatus, setArticleStatus] = useState("");

  //-------------------------------------------------
  // author options
  const [authorOps, setAuthorOps] = useState([]);
  const [authorOps1, setAuthorOps1] = useState([]);
  //-------------------------------------------------

  //-------------------------------------------------
  // section options
  const [sectionOps, setSectionOps] = useState([]);
  const [sectionGrouped, setSectionGrouped] = useState([]);
  const [sectionField, setSectionField] = useState("");
  //-------------------------------------------------

  //-------------------------------------------------
  // tag options
  const [tagOptions, setTagOptions] = useState([]);
  const [tagOps, setTagOps] = useState([]);
  const [tagOpsCopy, setTagOpsCopy] = useState([]);
  //-------------------------------------------------

  //-------------------------------------------------
  // STATES USED FOR HEADER TEXTS
  // saving state in header
  const [isSaving, setIsSaving] = useState(false);
  // title for breadcrumbs
  const [title, setTitle] = useState("");
  //-------------------------------------------------

  //-------------------------------------------------
  // image library
  const [modalAddMainImage, setModalAddMainImage] = useState(false);
  const [modalAddMainImage2, setModalAddMainImage2] = useState(false);
  const [searchText, setSearchText] = useState("");
  //-------------------------------------------------

  //-------------------------------------------------
  // validation states of article title if unique.
  const [isUniqueTitle, setIsUniqueTitle] = useState(true);
  const [isUniqueTitleShow, setIsUniqueTitleShow] = useState(false);
  const [isUniqueTitleLoading, setIsUniqueTitleLoading] = useState(false);
  //-------------------------------------------------

  // "Article Saved!" notif state
  const [savingText, setSavingText] = useState("");

  // auto save id
  const [autoSaveId, setAutoSaveId] = useState("");

  // auto save handling indication
  const [autoSaveRuns, setAutoSaveRuns] = useState(false);
  const [isHandlingAutoSave, setIsHandlingAutoSave] = useState(false);

  // saved tags
  const [savedTags, setSavedTags] = useState([]);

  const [editorState, setEditorState] = useState(null);

  //uncategorize & is not yet rechanneled state
  const [isUncategorized, setIsUncategorized] = useState(false);
  const [isNotYetRechanneled, setIsNotYetRechanneled] = useState(false);

  //validations if article is locked or article is disabled
  const [isLocked, setIsLocked] = useState({
    locked: false,
    locked_by_name: "",
  });

  //validation of section & slug field
  const [enableSection, setEnableSection] = useState(false);
  const [enableSlug, setEnableSlug] = useState(false);

  // article state clone (for auto save every 2mins)
  const articleStateClone = useRef(articleState);
  articleStateClone.current = articleState;

  //do not show dropdown when input search is empty
  const [showDropdown, setShowDropdown] = useState(true);

  //preViewModalState
  const [previewModal, setPreviewModal] = useState({
    open: false,
    data: {},
  });

  //wordCount
  const [wordCount, setWordCount] = useState(0);
  const [isLoadingTag, setIsLoadingTag] = useState(false);

  //isEqual state (disabling of save button)
  const [isEqual, setIsEqual] = useState(true);

  //show/hide save button
  const [isSaved, setIsSaved] = useState(false);

  //check if param saved=1 if yes retain "Article Saved" Notif and hide Save button
  useEffect(() => {
    if (isEdit) {
      const isSavedParam = JSON.parse(localStorage.getItem("saved_notif"));
      isSavedParam?.includes(match.params.id?.toString())
        ? setIsSaved(true)
        : setIsSaved(false);
    }
  }, [isEdit, match.params.id]);

  //extractDataFromGeneratedUrl(generatedUrl)
  //@param generatedUrl : url combination of baseurl, section and slug
  const extractDataFromGeneratedUrl = (generatedUrl) => {
    //split the string
    const extractedData = generatedUrl.split("/");
    //error message
    const errorMessage = "Wrong Format";
    //simple validation
    //make sure that count('/') == 5
    //and start is always http
    if (
      extractedData.length === 5 &&
      generatedUrl.slice(0, 4).trim().toLowerCase() === "http"
    ) {
      const domain = `${extractedData[0]}//${extractedData[1]}${extractedData[2]}`;
      const section_url = extractedData[3];
      const slug = extractedData[4];
      return { domain, section_url, slug };
    } else if (
      extractedData.length === 6 &&
      generatedUrl.slice(0, 4).trim().toLowerCase() === "http"
    ) {
      const domain = `${extractedData[0]}//${extractedData[1]}${extractedData[2]}`;
      const section_url = `${extractedData[3]}/${extractedData[4]}`;
      const slug = extractedData[5];
      return { domain, section_url, slug };
    }
    return { errorMessage };
  };

  /**
   * generating URL based on domain, section url & slug
   * @param {string} domain
   * @param {string} section_url
   * @param {string} slug
   */
  const generateURL = (domain, section_url, slug) => {
    return `${domain}/${section_url}/${slug}`;
  };

  /**
   * async function that fetches all active sections in the CMS
   */
  const loadSectionData = async () => {
    //api call
    const sections = await getSectionOps("");
    const parentSection = await getParentsGrouped("");
    //construct data
    const sectionList =
      sections &&
      sections.map((s) => ({
        value: s.section,
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
    //set to state
    setSectionGrouped(grouped);
    setSectionOps(sectionList);
    return sectionList;
  };

  /**
   * async function that fetches all active users in the CMS
   */
  const loadAuthorData = async () => {
    //api call
    const authors = await getAllUserByAuthors();
    if (authors && isNotEmptyArray(authors)) {
      const authorOptions = authors
        ?.filter((item) => item.status === 1)
        ?.map((a) => ({
          value: a.display_name,
          label: a.display_name,
          user_id: a.user_id,
          display_name: a.display_name,
        }));
      //set to state
      setAuthorOps(authorOptions);
      setAuthorOps1(authorOptions);
      return authorOptions;
    }
  };

  /**
   * async function that fetches all article data by article ID
   */
  const loadArticleData = async (tagData, sectionData) => {
    setIsArticleHandling(true);
    let initialUncategorized;
    //api call
    const article = await getArticleById(match.params.id);
    const resData = article?.data;
    if (resData && isNotEmptyObject(resData)) {
      //check if article is disabled then redirect to dashboard
      if (resData.status === 3) {
        window.location.href = "/";
      } else if (
        (resData.auto_save !== 0 &&
          resData.auto_save_by !== currentUser?.user_id) ||
        (resData.locked_by !== 0 && resData.locked_by !== currentUser?.user_id)
      ) {
        //check if article is locked or auto saved by someone
        setTitle(resData.title);
        setIsLocked({
          locked: true,
          locked_by_name: resData.auto_save
            ? resData.auto_save_by_name
            : resData.locked_by_name,
        });
        setIsArticleHandling(false);
      } else {
        setIsLocked({
          locked: false,
          locked_by_name: "",
        });
        //check if article section is uncategorized
        setIsUncategorized(
          resData.section_name === "Uncategorized" && resData.section_id === 0
        );
        //filter article section for section options
        const articleSection =
          isNotEmptyArray(sectionData) &&
          sectionData.filter(
            (s) => s.section_id?.toString() === resData.section_id?.toString()
          );
        //check if section is active
        const getSectionById = await checkIfSectionIsActive(
          resData.section_id?.toString()
        );
        //check if section is not active. if yes add section as uncategorized
        if (getSectionById && isNotEmptyObject(getSectionById)) {
          setIsNotYetRechanneled(getSectionById.status === 0);
        }
        if (
          resData.section_name === "Uncategorized" &&
          resData.section_id === 0
        ) {
          initialUncategorized = [
            {
              label: resData.section_name,
              value: resData.section_name,
              section_id: resData.section_id,
              section_name: resData.section_name,
            },
          ];
        }
        //filter article authors from author options
        const articleAuthors = resData.authors.map((a) => ({
          value: a.author,
          label: a.author,
          user_id: a.author_id,
          display_name: a.author,
        }));
        //filter article tags from tag options
        const articleTags = resData.tags
          .map((tag) => {
            const findTag = tagData.filter((t) => t.tag_id === tag.tag_id);
            return findTag[0];
          })
          ?.filter((tag) => tag);
        //construct article state
        const newArticleState = {
          sections:
            resData.section_name === "Uncategorized" && resData.section_id === 0
              ? initialUncategorized
              : articleSection[0],
          authors: articleAuthors,
          title: resData.title,
          slug: resData.slug,
          url: extractDataFromGeneratedUrl(resData.url),
          blurb: resData.blurb,
          body_content: resData.body_content,
          display_author: resData.display_author,
          image_path: resData.image_path,
          published_date: resData.published_date,
          status: resData.status,
          tags: articleTags,
          display_image: resData.display_image,
          first_published: resData.first_published,
        };
        setSectionField(
          resData.section_name === "Uncategorized" && resData.section_id === 0
            ? "Uncategorized"
            : resData.section_id?.toString()
        );
        setArticleState(newArticleState);
        setArticleStateBaseClone(newArticleState);
        setTitle(resData.title);
        setArticleStatus(resData.status);
        setIsArticleHandling(false);
      }
    } else {
      window.location.href = "/";
    }
  };

  /**
   * async function that fetches all active tags in the CMS
   */
  const loadTags = async () => {
    //api calls
    //fetch all active tags
    const tags = await getTagOps();
    //get count for tags
    const tagCounts = await postTagOptionsCount(tags);
    if (tags && tagCounts && isNotEmptyArray(tags)) {
      //construct data
      const tagOptions = tagCounts.map((tag) => ({
        value: tag.name,
        label: tag.name,
        tag_id: tag.tag_id,
        count: tag.article_count,
      }));
      tagOptions.sort((a, b) => (a.count > b.count ? -1 : 1));
      //set to state
      setTagOps(tagOptions);
      setTagOptions(tagOptions);
      setTagOpsCopy(tagOptions);
      return tagOptions;
    }
  };

  /**
   * async function that fetches all data in one call
   */
  const loadAllData = async () => {
    setIsArticleHandling(true);
    const images = getAllImage();
    const tags = loadTags();
    const section = loadSectionData();
    const authors = loadAuthorData();
    await Promise.all([images, tags, authors, section]);
    !isEdit && setIsArticleHandling(false);
  };

  /**
   * function that handles publish notification
   */
  const handleNotify = (articleTitle, publishedBy) => {
    sendJsonMessage({
      action: "notification",
      articleTitle: articleTitle,
      publishedBy: publishedBy,
    });
  };

  /**
   * add image from image library to body content
   * @param {object} image - values of selected image
   */
  const handleAddImage = (image) => {
    editorState?.editorManager?.execCommand(
      "mceInsertContent",
      false,
      `<figure class="image credits">
        <img width="100%" class="credits" src="${
          image.path !== null ? image.path : ""
        }" />

        <figcaption class"credits" style="display: flex;">
          <span class="c-cptn__txt">Caption</span>
          
          ${
            image.photographer &&
            (image.photographer !== null || image.photographer !== "null")
              ? `<div class="c-cptn__crdt">&nbsp;Photo:
              <span class="c-cptn__name">&nbsp;${image.photographer}&nbsp;</span>
            </div>`
              : ""
          }
          ${
            image.illustrator &&
            (image.illustrator !== null || image.illustrator !== "null")
              ? `<div class="c-cptn__crdt">Illustrator: 
              <span class="c-cptn__name">
                &nbsp;${image.illustrator}&nbsp;
              </span>
            </div>`
              : ""
          }
          ${
            image.link_label &&
            (image.link_label !== null || image.link_label !== "null")
              ? `<a href="#" class="c-cptn__link">&nbsp;${image.link_label}&nbsp;</a>`
              : ""
          }
        </figcaption>

      </figure>`
    );

    // newNode.src = image;
    // range.insertNode(newNode);

    editorState?.editorManager?.execCommand("mceFocus", false, "body_content");
  };

  useEffect(() => {
    loadAllData();
  }, []); //eslint-disable-line

  useEffect(() => {
    isEdit && loadArticleData(tagOps, sectionOps);
  }, [tagOps, sectionOps, isEdit]); //eslint-disable-line

  //check if state has changes
  useEffect(() => {
    if (isEdit && !isArticleHandling) {
      if (_.isEqual(articleState, articleStateBaseClone)) {
        setIsEqual(true);
        isSaved && setSavingText("Article Saved!");
      } else {
        setIsEqual(false);
        isSaved && setSavingText("");
      }
    }
  }, [articleState, articleStateBaseClone, isEdit, isSaved, isArticleHandling]);

  //validation if fields are all valid
  const _isValidAllFields =
    isNotEmptyString(articleState.title) &&
    isUniqueTitle &&
    (isNotEmptyObject(articleState.sections) ||
      isNotEmptyArray(articleState.sections)) &&
    (isNotEmptyObject(articleState.authors) ||
      isNotEmptyArray(articleState.authors)) &&
    isNotEmptyString(articleState.blurb) &&
    isNotEmptyString(articleState.body_content) &&
    isNotEmptyString(articleState.image_path) &&
    isNotEmptyString(articleState.slug);

  /**
   * append author id, published date & word count when published
   * @param {string} slug - get existing slug
   * @param {array} authors - array of authors
   * @param {string} publishDate 0 published date of the article
   */
  const generateSlugOnPublished = (slug, authors, publishDate) => {
    //join all article authors format: a{id} e.g. a21-a23-a45
    const genAuthors = authors.map((a) => `a${a.author_id}`).join("-");
    //change the published date format
    const date = parseDate(publishDate, "YYYYMMDD");
    //append word count if body content is equal or greater than 1000
    //e.g lfrm1 || lfrm2 and so on
    const _wordCount = appendLfrm(wordCount);
    return _wordCount < 1000
      ? `${slug}-${genAuthors}-${date}`
      : `${slug}-${genAuthors}-${date}-${_wordCount}`;
  };

  /**
   * generate slug based on article title
   */
  useEffect(() => {
    if (isEdit) {
      if (articleState?.first_published === 0) {
        isNotEmptyString(articleState.title) &&
          articleState.status !== 1 &&
          handleChangeArticle("slug", formatSlug(articleState.title));
      }
    } else {
      isNotEmptyString(articleState.title) &&
        articleState.status !== 1 &&
        handleChangeArticle("slug", formatSlug(articleState.title));
    }
  }, [articleState.title]); /*eslint-disable-line */

  /**
   * check if title is unique
   */
  const checkArticleTitle = async () => {
    //check if title is not empty
    if (isNotEmptyString(articleState.title)) {
      setIsUniqueTitleLoading(true);
      const res = await checkTitle(encodeURIComponent(articleState.title));
      setIsUniqueTitleLoading(false);
      if (res && res?.length > 0) {
        if (match.params.id) {
          if (res[0]?.article_id?.toString() === match.params.id?.toString()) {
            setIsUniqueTitle(true);
          } else {
            setIsUniqueTitle(false);
          }
        } else {
          if (autoSaveId !== "") {
            if (res[0]?.article_id?.toString() === autoSaveId?.toString()) {
              setIsUniqueTitle(true);
            } else {
              setIsUniqueTitle(false);
            }
          } else {
            setIsUniqueTitle(false);
          }
        }
      } else {
        setIsUniqueTitle(true);
      }
      setIsUniqueTitleShow(true);
    }
  };

  /**
   * handles changes in article state
   */
  const handleChangeArticle = (type, value) => {
    setArticleState({
      ...articleState,
      [type]: value,
    });
  };

  /**
   * handling tags on save of article
   * @param {array} data - article data in saved article
   * @param {array} autoSave - auto save article data (used for auto save existing)
   */
  const handleTags = async (data, autoSave) => {
    let o_tags = [];
    let n_tags = [];
    //get all new created tags inside the article form
    const newTags = data?.filter((tag) => tag.__isNew__);
    if (newTags?.length > 0) {
      //call create tag api
      const createNewTags = await Promise.all(
        newTags.map(async (t) => {
          const res = await addTag({
            name: t.value,
            slug: formatSlug(t.value),
            type: 1,
            status: 1,
          });
          return res.data.data;
        })
      );
      //contruct data
      const _newTags = createNewTags.map((t) => {
        return {
          tag_id: t.id,
          tag_name: t.name,
        };
      });
      //assign
      n_tags = _newTags;
    }
    //get all old tags (in options) inside the article form
    const oldTags = data
      ?.filter((tag) => tag.tag_id)
      ?.map((t) => {
        return {
          tag_id: t.tag_id,
          tag_name: t.value,
        };
      });
    if (oldTags?.length > 0) {
      //assign
      o_tags = oldTags;
    }
    //join old tags and new tags to create new array of tags
    const allTags =
      isNotEmptyArray(o_tags) && isNotEmptyArray(n_tags)
        ? [...o_tags, ...n_tags]
        : isNotEmptyArray(o_tags)
        ? o_tags
        : isNotEmptyArray(n_tags)
        ? n_tags
        : [];
    //update article state->tags and remove _isNew tag
    if (newTags?.length > 0) {
      const removedNewInTags = allTags?.map((tag) => {
        return {
          label: tag.tag_name,
          tag_id: tag.tag_id,
          value: tag.tag_name,
        };
      });
      setSavedTags(removedNewInTags);
      autoSave && isNotEmptyObject(autoSave)
        ? setArticleState({ ...autoSave, tags: removedNewInTags })
        : handleChangeArticle("tags", removedNewInTags);
    }
    return allTags;
  };

  /**
   * handles selected author data
   */
  const handleAuthors = (data) => {
    const respAuthor = data.map((item) => {
      return {
        author_id: item.user_id,
        author_name: item.display_name,
      };
    });
    return respAuthor;
  };

  /**
   * async funtion that handles creating new article
   * @param {string} status - status of the article
   * 0 - draft
   * 1 - publish
   * 2 - publish later
   * @param {string} date - publish later date
   */
  const handleAddArticle = async (status, date) => {
    //check if all fields are fields
    if (_isValidAllFields) {
      setIsSaving(true);
      const now = new Date();
      try {
        //fix publish date format
        const publishDate =
          status === "1"
            ? `${parseDate(now, "YYYY-MM-DD HH:mm")}:00`
            : status === "2"
            ? `${parseDate(date, "YYYY-MM-DD HH:mm")}:00`
            : "";
        //check if status is 1 || 2 and if first_published === 0 to append author id, publish date and lfrm in article slug
        const articleSlug =
          (status === "1" || status === "2") &&
          (!articleState?.first_published ||
            articleState?.first_published === 0)
            ? generateSlugOnPublished(
                articleState.slug,
                handleAuthors(articleState.authors),
                status === "2"
                  ? `${parseDate(date, "YYYY-MM-DD HH:mm")}:00`
                  : now
              )
            : articleState.slug;
        //generate url
        const url = generateURL(
          domain,
          articleState.url?.section_url,
          articleSlug
        );
        //construct payload data
        const payloadData = {
          title: articleState.title,
          section_id: articleState.sections.section_id,
          section_name: articleState.sections.section_name,
          slug:
            status === "1" &&
            (!articleState?.first_published ||
              articleState?.first_published === 0)
              ? generateSlugOnPublished(
                  articleState.slug,
                  handleAuthors(articleState.authors),
                  now
                )
              : articleState.slug,
          url: url,
          blurb: articleState.blurb,
          body_content: articleState.body_content,
          display_author: articleState.display_author,
          image_path: articleState.image_path,
          status: status?.toString(),
          tags: await handleTags(articleState.tags),
          authors: handleAuthors(articleState.authors),
          display_image: articleState.display_image,
          locked_by: 0,
        };
        let response;
        if (isNotEmptyString(publishDate)) {
          response = await addArticle({
            ...payloadData,
            published_date: publishDate,
          });
        } else {
          response = await addArticle(payloadData);
        }
        if (response.successful) {
          setIsSaving(false);
          //check if response article status is published (1)
          //if yes trigger publish notification
          if (response?.data?.status?.toString() === "1") {
            handleNotify(articleState.title, currentUser.display_name);
            setTimeout(() => {
              window.location.href = `/article/articleForm/${response.data.id}`;
            }, 2000);
          } else {
            window.location.href = `/article/articleForm/${response.data.id}`;
          }
          setSavingText("Article Saved!");
        } else {
          setIsSaving(false);
          setSavingText("Failed Saving Article");
        }
      } catch (error) {
        setIsSaving(false);
        setSavingText(error);
      }
    }
  };

  /**
   * async funtion that handles editing existing article
   * @param {string} status - status of the article
   * 0 - draft
   * 1 - publish
   * 2 - publish later
   * @param {string}  date- publish later date
   * @param {string} notif - prop to distinguish if publish notification will trigger
   */
  const handleEditArticle = async (status, date, notif) => {
    //check if all fields are fields
    if (_isValidAllFields) {
      //check if article status disabled (3)
      if (status === "3") {
        setIsSaving(true);
        //call edit article api then redirect user to dashboard
        await editArticle(
          {
            status: "3",
            locked_by: 0,
            locked_by_name: "",
            auto_save: 0,
            with_log: "1",
          },
          match.params.id
        );
        setIsSaving(false);
        window.location.href = "/";
      } else {
        const now = new Date();
        //fix publish date format
        const publishDate =
          status === "1"
            ? `${parseDate(now, "YYYY-MM-DD HH:mm")}:00`
            : status === "2"
            ? `${parseDate(date, "YYYY-MM-DD HH:mm")}:00`
            : "";
        setIsSaving(true);
        //check if status is publish or published later and if not yet published before to append author id, publish date and lfrm in article slug
        const articleSlug =
          (status === "1" || status === "2") &&
          (!articleState?.first_published ||
            articleState?.first_published === 0)
            ? generateSlugOnPublished(
                articleState.slug,
                handleAuthors(articleState.authors),
                status === "2"
                  ? `${parseDate(date, "YYYY-MM-DD HH:mm")}:00`
                  : now
              )
            : articleState.slug;
        //generate url
        const url = generateURL(
          domain,
          articleState.url?.section_url,
          articleSlug
        );
        //check if allowed to edit and allowed to publish an article
        if (isAllowedToEdit) {
          try {
            //construct payload data
            const payloadData = {
              article_id: isEdit && match.params.id,
              title: articleState.title,
              section_id: articleState.sections.section_id,
              section_name: articleState.sections.section_name,
              slug: articleSlug,
              url: url,
              blurb: articleState.blurb,
              body_content: articleState.body_content,
              display_author: articleState.display_author,
              image_path: articleState.image_path,
              image_id: articleState.image_id,
              status: status?.toString(),
              tags: await handleTags(articleState.tags),
              authors: handleAuthors(articleState.authors),
              display_image: articleState.display_image,
              // locked_by: 0,
              // locked_by_name: "",
              auto_save: 0,
              auto_save_by: 0,
              auto_save_by_name: "",
              with_log: "1",
            };
            let response;
            if (status) {
              response = await editArticle(
                { ...payloadData, published_date: publishDate },
                match.params.id
              );
            } else {
              response = await editArticle(payloadData, match.params.id);
            }
            if (response.successful) {
              setIsSaving(false);
              //-------------------------------------------------
              // FOR "Article Saved!" Notification
              setSavingText("Article Saved!");
              //check if there is existing saved_notif id
              const getSavedItems = JSON.parse(
                localStorage.getItem("saved_notif")
              );
              //append current article id to retain notif even if page refreshes
              const appendNewItems =
                getSavedItems !== null
                  ? [...getSavedItems, match.params.id?.toString()]
                  : [match.params.id?.toString()];
              //set to local storage
              localStorage.setItem(
                "saved_notif",
                JSON.stringify([...new Set(appendNewItems)])
              );
              //-------------------------------------------------

              /* used for toast notif*/
              //check if response article status is published (1)
              //if yes trigger publish notification
              if (
                response?.data?.status?.toString() === "1" &&
                notif !== "off"
              ) {
                handleNotify(articleState.title, currentUser.display_name);
                setTimeout(() => {
                  window.location.href = `/article/articleForm/${match.params.id}`;
                }, 2000);
              } else {
                window.location.href = `/article/articleForm/${match.params.id}`;
              }
            } else {
              setIsSaving(false);
              setSavingText("Failed Saving Article");
            }
          } catch (error) {
            setIsSaving(false);
            setSavingText(error);
          }
        } else if (isAllowedToPublished) {
          //if no permission to edit check if allowed to publish
          try {
            const payloadData = {
              status: status?.toString(),
            };
            let response;
            status
              ? (response = await editArticle(
                  { ...payloadData, published_date: publishDate },
                  match.params.id
                ))
              : (response = await editArticle(payloadData, match.params.id));
            if (response.successful) {
              setIsSaving(false);
              setSavingText("Article Saved!");
              const getSavedItems = JSON.parse(
                localStorage.getItem("saved_notif")
              );
              const appendNewItems =
                getSavedItems !== null
                  ? [...getSavedItems, match.params.id?.toString()]
                  : [match.params.id?.toString()];
              localStorage.setItem(
                "saved_notif",
                JSON.stringify([...new Set(appendNewItems)])
              );
              window.location.href = `/article/articleForm/${match.params.id}`;
            } else {
              setIsSaving(false);
              setSavingText("Failed Saving Article");
            }
          } catch (error) {
            setIsSaving(false);
            setSavingText(error);
          }
        }
      }
    }
  };

  /**
   * AUTO SAVE (NEW ARTICLE)
   * async funtion that handles auto saving of new article
   * @param {string} status - status of the article
   * 0 - draft
   * 1 - publish
   * 2 - publish later
   * @param {string}  date- publish later date
   */
  const handleAutoSaveNew = async (status, date) => {
    //check if all fields are valid
    if (_isValidAllFields) {
      const now = new Date();
      try {
        setIsHandlingAutoSave(true);
        //fix publish date format
        const publishDate =
          status === "1"
            ? `${parseDate(now, "YYYY-MM-DD HH:mm")}:00`
            : status === "2"
            ? `${parseDate(date, "YYYY-MM-DD HH:mm")}:00`
            : "";
        //verify tags if has auto save id append savedTags if not use the state's tags.
        const verifyTags = hasAutoSaveId() ? savedTags : articleState.tags;
        //check if status is 1 || 2 and if first_published === 0 to append author id, publish date and lfrm in article slug
        const articleSlug =
          (status === "1" || status === "2") &&
          (!articleState?.first_published ||
            articleState?.first_published === 0)
            ? generateSlugOnPublished(
                articleState.slug,
                handleAuthors(articleState.authors),
                status === "2"
                  ? `${parseDate(date, "YYYY-MM-DD HH:mm")}:00`
                  : now
              )
            : articleState.slug;
        //generate url
        const url = generateURL(
          domain,
          articleState.url?.section_url,
          articleSlug
        );
        //construct payload data
        let payloadData = {
          title: articleState.title,
          section_id: articleState.sections.section_id,
          section_name: articleState.sections.section_name,
          slug: articleSlug,
          url: url,
          blurb: articleState.blurb,
          body_content: articleState.body_content,
          display_author: articleState.display_author,
          image_path: articleState.image_path,
          image_id: articleState.image_id,
          status: status?.toString() || "0",
          tags: await handleTags(verifyTags),
          authors: handleAuthors(articleState.authors),
          locked_by: currentUser?.user_id,
          locked_by_name: currentUser?.display_name,
          auto_save: isNotEmptyString(status) ? 0 : 1,
          display_image: articleState.display_image,
        };

        //append auto save user id and name
        if (!isNotEmptyString(status)) {
          payloadData = {
            ...payloadData,
            auto_save_by: currentUser?.user_id,
            auto_save_by_name: currentUser?.display_name,
          };
        }
        isNotEmptyString(status) && setIsSaving(true);
        let res;
        //check if has auto saved id then append published date in payload
        if (hasAutoSaveId()) {
          if (status) {
            res = await editArticle(
              {
                ...payloadData,
                published_date: publishDate,
                with_log: "1",
                locked_by: "0",
                locked_by_name: "",
              },
              autoSaveId
            );
          } else {
            res = await editArticle(
              { ...payloadData, with_log: "1" },
              autoSaveId
            );
          }
        } else {
          res = await addArticle(payloadData);
        }
        if (res.successful) {
          if (hasAutoSaveId() && isNotEmptyString(status)) {
            setAutoSaveId("");
            //check if response article status is published (1)
            //if yes trigger publish notification
            if (res?.data?.status?.toString() === "1") {
              handleNotify(articleState.title, currentUser.display_name);
              setTimeout(() => {
                window.location.href = `/article/articleForm/${autoSaveId}`;
              }, 2000);
            } else {
              window.location.href = `/article/articleForm/${autoSaveId}`;
            }
          } else {
            console.log("----Auto saved!!!----");
            setAutoSaveId(res.data.id);
          }
        }
        isNotEmptyString(status) && setIsSaving(false);
        setIsHandlingAutoSave(false);
      } catch (error) {
        console.log(error);
      }
    }
  };

  /**
   * AUTO SAVE (EXISTING ARTICLE)
   * occurs every 2mins
   * async funtion that handles auto saving of an existing article
   * @param {object}  data - article data
   */
  const handleAutoSaveExisting = async (data) => {
    const url = generateURL(domain, articleState.url?.section_url, data.slug);
    try {
      const payloadData = {
        article_id: isEdit && match.params.id,
        title: data.title,
        section_id: data.sections.section_id,
        section_name: data.sections.section_name,
        slug: data.slug,
        url: url,
        blurb: data.blurb,
        body_content: data.body_content,
        display_author: data.display_author,
        image_path: data.image_path,
        tags: await handleTags(data.tags, data),
        authors: handleAuthors(data.authors),
        // locked_by: 0,
        // locked_by_name: null,
        display_image: data.display_image,
        image_id: data.image_id,
        autosave: "1",
        auto_save: 1,
        auto_save_by: currentUser?.user_id,
        auto_save_by_name: currentUser?.display_name,
        with_log: "0",
      };
      await editArticle(payloadData, match.params.id);
      console.log("Auto saved!!!");
    } catch (error) {
      console.log(error);
    }
  };

  //listeners for generating URL
  useEffect(() => {
    if (isEdit) {
      if (articleState?.sections?.url && articleState.slug) {
        const section_url =
          articleState?.sections[0]?.value === "Uncategorized" ||
          articleState?.sections?.length === 0
            ? articleState?.url?.section_url
            : articleState?.sections?.url;
        const newUrl = {
          domain: domain,
          section_url: section_url,
          slug: articleState.slug,
        };
        handleChangeArticle("url", newUrl);
      }
    } else {
      if (
        isNotEmptyObject(articleState.sections) &&
        isNotEmptyString(articleState.slug)
      ) {
        const newUrl = {
          domain: domain,
          section_url: articleState.sections.url,
          slug: articleState.slug,
        };
        handleChangeArticle("url", newUrl);
        // handleChangeArticle(
        //   "url",
        //   `${domain}/${articleState.sections.url}/${articleState.slug}`
        // );
      } else if (isNotEmptyObject(articleState.sections)) {
        const newUrl = {
          domain: domain,
          section_url: articleState.sections.url,
          slug: "",
        };
        handleChangeArticle("url", newUrl);
        // handleChangeArticle("url", `${domain}/${articleState.sections.url}/`);
      } else if (isNotEmptyString(articleState.slug)) {
        const newUrl = {
          domain: domain,
          section_url: "section/subsection",
          slug: articleState.slug,
        };
        handleChangeArticle("url", newUrl);
        // handleChangeArticle(
        //   "url",
        //   `${domain}/section/subsection/${articleState.slug}`
        // );
      } else {
        const newUrl = {
          domain: domain,
          section_url: "section/subsection",
          slug: "",
        };
        handleChangeArticle("url", newUrl);
        // handleChangeArticle("url", `${domain}/section/subsection/`);
      }
    }
  }, [articleState.sections, articleState.slug]); //eslint-disable-line

  const exitArticle = () => {
    alert("Please exit this article first");
  };

  /**
   * async function that hanldes exiting the current article
   */
  const handleExitArticle = async () => {
    //check if user has any of these permissions
    const permissionsToLock = [
      "Article.Edit",
      "Article.Disable",
      "Article.Publish",
      "Article.Change_Slug",
      "Article.Change_Section",
    ];
    //remove "Article Saved!" notif id in local storage
    removeSaveNotifId(match.params.id);
    if (
      isLocked.locked ||
      !userPermissions.some((code) => permissionsToLock.includes(code))
    ) {
      window.location.href = "/articles";
    } else {
      setIsSaving(true);
      const payloadData = {
        locked_by: 0,
        auto_save: 0,
      };
      // const response = await editArticle(payloadData, match.params.id);
      const response = await lockUnlockArticle(
        match.params.id,
        "lock",
        payloadData
      );
      setIsSaving(false);
      if (response?.successful) {
        window.location.href = "/articles";
      }
    }
  };

  /**
   * handles article title border based on article title's length
   * @param {striny} input - article title state
   * @param {number} safe - minimum recommended numbers allowed
   * @param {number} warning - maximum recommended numbers allowed
   */
  const inputBorder = (input, safe, warning) => {
    const length = input.length;
    if (length !== 0) {
      if (length < safe) {
        return "border-success";
      } else if (length === safe || length < warning) {
        return "border-warning";
      } else if (length >= warning) {
        return "border-danger";
      }
    } else {
      return "";
    }
  };

  /**
   * handles article title feedback (if title is already taken or not)
   */
  const articleTitleFeedback = () => {
    const length = articleState.title.length;
    if (isUniqueTitleLoading) {
      return <PulseLoader color="#c2c2c2" size="6" />;
    } else {
      if (isUniqueTitle) {
        if (length <= 55) {
          return (
            <p className="text-success mb-1">
              &#128504; &nbsp; Nice! Your title has the right length and doesn’t
              have a duplicate entry.
            </p>
          );
        } else {
          return (
            <p className="text-danger mb-1">
              &#x24E7; &nbsp; WARNING! Your title is too long and will get cut
              when shared on social media. Please make it 55 characters or below
            </p>
          );
        }
      } else {
        return (
          <p className="text-danger mb-1">
            &#x24E7; &nbsp;Sorry, that title is already taken. Please provide
            another one.
          </p>
        );
      }
    }
  };

  //autosave every 2 mins.
  useEffect(() => {
    if (isEdit && _isValidAllFields && !isArticleHandling) {
      console.log("----Timer in Auto save existing article starts----");
      const interval = setInterval(() => {
        handleAutoSaveExisting(articleStateClone.current);
      }, 120 * 1000);
      return () => clearInterval(interval);
    }
  }, [isArticleHandling, _isValidAllFields]); //eslint-disable-line

  //checking if there's an auto save id
  const hasAutoSaveId = () => {
    if (autoSaveId !== "") {
      return true;
    } else {
      return false;
    }
  };

  /**
   * handles section field disabling
   */
  const isSectionDisabled = () => {
    //only applies if for is in edit mode
    if (isEdit) {
      //check article status is published or published later
      if (articleState?.status === 1 || articleState?.status === 2) {
        //check user permission
        if (isAllowedToEdit && isAllowedToEditSection) {
          if (enableSection) {
            return false;
          } else {
            //check if section is uncategorized or not yet rechanneled
            if (isUncategorized) {
              return false;
            } else if (isNotYetRechanneled) {
              return false;
            } else {
              return true;
            }
          }
        } else {
          //check if section is uncategorized or not yet rechanneled
          if (isUncategorized) {
            return false;
          } else if (isNotYetRechanneled) {
            return false;
          } else {
            return true;
          }
        }
      } else if (
        articleState?.status === 0 &&
        articleState?.first_published === 1 &&
        isAllowedToEdit &&
        isAllowedToEditSection &&
        enableSection
      ) {
        //do not disable if article is draft and already published before
        return false;
      } else {
        if (isAllowedToEdit && isAllowedToEditSection) {
          if (isUncategorized) {
            return false;
          } else if (isNotYetRechanneled) {
            return false;
          } else if (articleState?.first_published === 1) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      }
    } else {
      return false;
    }
  };

   /**
   * handles slug field disabling
   */
  const isSlugDisabled = () => {
    //only applies if for is in edit mode
    if (isEdit) {
      //check article status is published or published later
      if (articleState.status === 1 || articleState.status === 2) {
        //check user permission
        if (isAllowedToEdit && isAllowedToEditSlug) {
          if (enableSlug) {
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      } else if (
        articleState.status === 0 &&
        articleState?.first_published === 1 &&
        isAllowedToEdit &&
        isAllowedToEditSlug &&
        enableSlug
      ) {
        //do not disable if article is draft and already published before
        return false;
      } else {
        //check if section is uncategorized or not yet rechanneled
        if (isAllowedToEdit && isAllowedToEditSlug) {
          if (articleState?.first_published === 1) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
      }
    } else {
      return false;
    }
  };

  useEffect(() => {
    articleState?.title === "" && setIsUniqueTitleShow(false);
  }, [articleState?.title]);

  //listner for auto save new article
  useEffect(() => {
    if (!isEdit && _isValidAllFields && !autoSaveRuns && !isHandlingAutoSave) {
      handleAutoSaveNew();
      setAutoSaveRuns(true);
    }
  }, [articleState, isUniqueTitle]); //eslint-disable-line


  /**
   * handles changes in section field
   */
  const handleChangeSection = (id) => {
    setSectionField(id);
    if (id !== "") {
      const getInfo = sectionOps?.filter(
        (section) => section.section_id?.toString() === id.toString()
      );
      if (getInfo?.length > 0) {
        setArticleState({
          ...articleState,
          url: {
            ...articleState?.url,
            section_url: getInfo[0]?.url,
          },
          sections: getInfo[0],
        });
      }
    } else {
      handleChangeArticle("sections", null);
    }
  };

  /**
   * validation if edit section text will show or not
   */
  const showEditSectionText = () => {
    if (isAllowedToEditSection) {
      if (
        (articleState.status === 1 ||
          articleState.status === 2 ||
          (articleState?.first_published === 1 && !isNotYetRechanneled)) &&
        !isUncategorized
      ) {
        if (articleState.status === 1 || articleState.status === 2) {
          if (isNotYetRechanneled) {
            return false;
          } else {
            return true;
          }
        } else {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  /**
   * async function that handles creating new tag
   * checking if inserted tag is already existing but disabled
   */

  const handleCreateNewTag = async (inputValue) => {
    setIsLoadingTag(true);
    const res = await checkIfTagsIsDisabled(inputValue);
    if (res?.data.length > 0) {
      dispatch(
        masterActions.updateNotificationModal({
          open: true,
          type: "error",
          headerText: "Warning",
          bodyText: (
            <div>
              <p>
                {" "}
                Entered tag is currently disabled, please reactive the tag
                before using it.{" "}
              </p>
              <h3 className="text-center">{res?.data[0]?.name}</h3>
            </div>
          ),
          callback: async (closeModal) => {
            closeModal();
          },
        })
      );
    } else if (res?.data.length === 0) {
      const newOption = {
        label: inputValue,
        value: inputValue,
        __isNew__: true,
      };
      handleChangeArticle("tags", [...articleState.tags, newOption]);
    }
    setIsLoadingTag(false);
  };

  //listen to every changes of body content and calculate the word count
  useEffect(() => {
    setWordCount(countWords(articleState?.body_content));
  }, [articleState?.body_content]);

  return (
    <>
      <div>
        <Header
          isAllowedToPublished={isAllowedToPublished}
          isAllowedToEdit={isAllowedToEdit}
          isAllowedToDisable={isAllowedToDisable}
          isAllowedToView={isAllowedToView}
          exitArticle={() => exitArticle()}
          handleExitArticle={() => handleExitArticle()}
          isEdit={isEdit}
          isSaving={isSaving}
          savingText={savingText}
          articleTitle={title}
          toggleSaveButton={() =>
            handleEditArticle(
              articleState.status?.toString(),
              articleState.status?.toString() === "2"
                ? articleState.published_date
                : "",
              "off"
            )
          }
          togglePublish={() => {
            hasAutoSaveId()
              ? handleAutoSaveNew("1")
              : isEdit
              ? handleEditArticle("1")
              : handleAddArticle("1");
          }}
          toggleDraft={() => {
            hasAutoSaveId()
              ? handleAutoSaveNew("0")
              : isEdit
              ? handleEditArticle("0")
              : handleAddArticle("0");
          }}
          status={articleState.status.toString()}
          togglePublishLater={(date) => {
            hasAutoSaveId()
              ? handleAutoSaveNew("2", date)
              : isEdit
              ? handleEditArticle("2", date)
              : handleAddArticle("2", date);
          }}
          toggleDisable={() => handleEditArticle("3")}
          togglePreview={() =>
            setPreviewModal({
              open: !previewModal.open,
              data: { article_id: match?.params?.id },
            })
          }
          isValidAllFields={_isValidAllFields}
          publishLaterDate={articleState.published_date}
          isLocked={isLocked.locked}
          isHandlingAutoSave={isHandlingAutoSave}
          articleStatus={articleStatus}
          isEqual={isEqual}
        />
        <div className="c-body c-main">
          <CContainer
            className={isArticleHandling ? "screen-loading-form" : ""}
          >
            {isArticleHandling ? (
              <CSpinner
                color="secondary"
                size="lg"
                className="screen-loading"
              />
            ) : isLocked.locked ? (
              <CAlert color="warning text-center p-4">
                <h2 className="mb-4">
                  <span className="text-bold">{isLocked.locked_by_name}</span>{" "}
                  is currently editing this article.
                </h2>
                <CLink to="/">Go back to article dashboard.</CLink>
              </CAlert>
            ) : (
              <CCard>
                <CCardBody className="position-relative">
                  <React.Fragment>
                    <CRow className="mb-3">
                      <CCol sm="12">
                        <h4 className="float-left">Article Title</h4>
                        <span className="text-danger float-right small">
                          <i>Required!</i>
                        </span>
                        <CTextarea
                          value={articleState.title}
                          onChange={(e) =>
                            handleChangeArticle("title", e.target.value)
                          }
                          type="text"
                          className={`scrollable-input h1 text-dark font-weight-bold ${inputBorder(
                            articleState.title,
                            45,
                            56
                          )}`}
                          onBlur={() => checkArticleTitle()}
                          disabled={isEdit && isEdit && !isAllowedToEdit}
                        />
                      </CCol>
                      <CCol sm="12">
                        <CFormText className="help-block d-flex justify-content-between">
                          <div>
                            {isNotEmptyString(articleState.title) &&
                            title !== articleState.title &&
                            isUniqueTitleShow
                              ? articleTitleFeedback()
                              : ""}
                            <p>
                              &#9432;&nbsp; This headline will appear on the
                              article landing page. The ideal length of an
                              article title should not exceed 55 characters
                            </p>
                          </div>
                          <p
                            className={`
                                ${
                                  articleState.title.length === 0
                                    ? ""
                                    : articleState.title.length <= 44
                                    ? "text-success"
                                    : articleState.title.length <= 55
                                    ? "text-warning"
                                    : "text-danger"
                                } 
                              `}
                          >
                            {articleState.title.length}/55
                          </p>
                        </CFormText>
                      </CCol>
                    </CRow>
                    <CRow className="mb-3">
                      <CCol sm="12">
                        <div className="overflow-hidden">
                          <h4 className="float-left">Section</h4>
                          {showEditSectionText() && (
                            <span
                              className="small text-info pl-2"
                              style={{
                                verticalAlign: "-webkit-baseline-middle",
                                cursor: "pointer",
                              }}
                              onClick={() => setEnableSection(true)}
                            >
                              Edit
                            </span>
                          )}
                          <span className="text-danger float-right small">
                            <i>Required!</i>
                          </span>
                        </div>
                        <CSelect
                          custom
                          name="section"
                          value={sectionField}
                          onChange={(e) => handleChangeSection(e.target.value)}
                          className="section-select"
                          disabled={isSectionDisabled()}
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
                          {isUncategorized && (
                            <option
                              style={{ display: "none" }}
                              value="Uncategorized"
                            >
                              Uncategorized
                            </option>
                          )}
                        </CSelect>
                        {/* <Select
                          value={articleState.sections}
                          onChange={(event) =>
                            handleChangeArticle("sections", event)
                          }
                          className="basic-single font-weight-bold"
                          classNamePrefix="select"
                          isClearable={true}
                          isSearchable={true}
                          options={sectionOps}
                          isDisabled={isSectionDisabled()}
                        /> */}
                      </CCol>
                      <CCol sm="12">
                        <CFormText
                          className="help-block"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <p>
                            &#9432; &nbsp; Please choose wisely. Section is part
                            of the article's URL structure, thus, it can no
                            longer be changed once published.
                          </p>
                        </CFormText>
                      </CCol>
                    </CRow>
                    <CRow className="mb-3">
                      <CCol sm="12">
                        <h4 className="float-left">Article Slug</h4>
                        {isAllowedToEditSlug &&
                          (articleState.status === 1 ||
                            articleState.status === 2 ||
                            articleState?.first_published === 1) && (
                            <span
                              className="small text-info pl-2"
                              style={{
                                verticalAlign: "-webkit-baseline-middle",
                                cursor: "pointer",
                              }}
                              onClick={() => setEnableSlug(true)}
                            >
                              Edit
                            </span>
                          )}
                        <CTextarea
                          className="font-weight-bold"
                          value={articleState.slug}
                          onChange={(e) =>
                            handleChangeArticle("slug", e.target.value)
                          }
                          type="text"
                          disabled={isSlugDisabled()}
                          onBlur={() =>
                            handleChangeArticle(
                              "slug",
                              formatSlug(articleState.slug)
                            )
                          }
                        />
                      </CCol>
                      <CCol sm="12">
                        <CFormText
                          className="help-block"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <p>
                            &#9432; &nbsp; Make sure that you review your
                            article slug before publishing. You may no longer
                            change it once published.
                          </p>
                          <p>0/65</p>
                        </CFormText>
                      </CCol>
                    </CRow>
                    <CRow className="mb-3">
                      <CCol sm="12">
                        <CInputGroup>
                          <CInputGroupPrepend>
                            <CInputGroupText
                              className={"bg-secondary"}
                              style={{ color: "#555" }}
                            >
                              URL
                            </CInputGroupText>
                          </CInputGroupPrepend>
                          <CInput
                            type="text"
                            disabled
                            style={{
                              color: "#999",
                              backgroundColor: "#000",
                            }}
                            value={
                              isNotEmptyObject(articleState?.url)
                                ? generateURL(
                                    articleState?.url?.domain,
                                    articleState?.url?.section_url,
                                    articleState?.url?.slug
                                  )
                                : ""
                            }
                            readOnly
                            className="font-weight-bold"
                          />
                        </CInputGroup>
                      </CCol>
                      <CCol sm="12">
                        <CFormText className="help-block">
                          &#9432; &nbsp; Your article would be published and
                          accessed thru the URL address above.
                        </CFormText>
                      </CCol>
                    </CRow>
                    <CRow className="mb-3">
                      <CCol sm="12">
                        <h4 className="float-left">Blurb</h4>
                        <span className="text-danger float-right small">
                          <i>Required!</i>
                        </span>
                        <CTextarea
                          value={articleState.blurb}
                          onChange={(e) =>
                            handleChangeArticle("blurb", e.target.value)
                          }
                          type="text"
                          className={`font-weight-bold ${inputBorder(
                            articleState.blurb,
                            46,
                            56
                          )}`}
                          disabled={isEdit && !isAllowedToEdit}
                        />
                      </CCol>
                      <CCol sm="12">
                        <CFormText className="help-block d-flex justify-content-between">
                          <div>
                            {articleState?.blurb !== "" &&
                              articleState?.blurb?.length >= 56 && (
                                <p className="text-danger mb-1">
                                  &#x24E7; &nbsp; WARNING! Your blurb is too
                                  long and will get cut when shared on social
                                  media. Please make it 55 characters or below.
                                </p>
                              )}
                            <p>
                              &#9432; &nbsp; Use a blurb to convey a short
                              statement to accompany your title. This is
                              displayed in the article page, as well as on
                              Facebook and Twitter
                            </p>
                          </div>
                          <p
                            className={`
                                ${
                                  articleState.blurb.length === 0
                                    ? ""
                                    : articleState.blurb.length <= 45
                                    ? "text-success"
                                    : articleState.blurb.length <= 55
                                    ? "text-warning"
                                    : "text-danger"
                                } 
                              `}
                          >
                            {articleState.blurb.length}/55
                          </p>
                        </CFormText>
                      </CCol>
                    </CRow>
                    <hr />
                    <CRow className="mb-3">
                      <CCol sm="12" className="d-flex justify-content-center">
                        <div className="tiny-wyswyg">
                          <div className="overflow-hidden">
                            <h4 className="float-left">Body Content</h4>
                            <span className="text-danger float-right small">
                              <i>Required!</i>
                            </span>
                          </div>
                          <div>
                            <div className="_editor-conainer">
                              <Editor
                                disabled={isEdit && !isAllowedToEdit}
                                apiKey="wbbtzdfkmqm97opuq26bm4tjbk4cvcc608d7l6zev91jrlkx"
                                value={articleState.body_content}
                                onEditorChange={(content) =>
                                  handleChangeArticle("body_content", content)
                                }
                                toolbar="undo redo | styleselect | bold italic | alignleft aligncenter | bullist numlist | link code imageLibrary | table fullscreen"
                                init={{
                                  toolbar_mode: "wrap",
                                  height: 500,
                                  width: "100%",
                                  menubar: false,
                                  image_caption: true,
                                  plugins: [
                                    "advlist autolink lists link image charmap print preview anchor searchreplace visualblocks code fullscreen insertdatetime media table paste code help wordcount",
                                  ],
                                  style_formats: [
                                    {
                                      title: "Headings",
                                      items: [
                                        { title: "Heading 2", format: "h2" },
                                        { title: "Heading 3", format: "h3" },
                                      ],
                                    },
                                    {
                                      title: "Inline",
                                      items: [
                                        { title: "Bold", format: "bold" },
                                        { title: "Italic", format: "italic" },
                                        {
                                          title: "Underline",
                                          format: "underline",
                                        },
                                        {
                                          title: "Strikethrough",
                                          format: "strikethrough",
                                        },
                                        {
                                          title: "Superscript",
                                          format: "superscript",
                                        },
                                        {
                                          title: "Subscript",
                                          format: "subscript",
                                        },
                                      ],
                                    },
                                    {
                                      title: "Blocks",
                                      items: [
                                        { title: "Paragraph", format: "p" },
                                        {
                                          title: "Blockquote",
                                          format: "blockquote",
                                        },
                                        { title: "Div", format: "div" },
                                        { title: "Pre", format: "pre" },
                                        {
                                          title: "Span",
                                          inline: "span",
                                          styles: { color: "auto" },
                                        },
                                      ],
                                    },
                                    {
                                      title: "Reverse Numbering",
                                      selector: "ol",
                                      attributes: { reversed: "reversed" },
                                    },
                                  ],
                                  setup: (editor) => {
                                    editor.ui.registry.addButton(
                                      "imageLibrary",
                                      {
                                        icon: "gallery",
                                        onAction: () => {
                                          setModalAddMainImage2(true);
                                          setEditorState(editor);
                                        },
                                        onSetup: (apiButton) => {
                                          const editorEventCallback = (
                                            eventApi
                                          ) => {
                                            apiButton?.setDisabled(
                                              eventApi?.element?.className ===
                                                "credits" ||
                                                eventApi?.element?.className ===
                                                  "image credits" ||
                                                eventApi?.element?.className ===
                                                  "c-cptn__txt" ||
                                                eventApi?.element?.className ===
                                                  "c-cptn__crdt" ||
                                                eventApi?.element?.className ===
                                                  "c-cptn__name" ||
                                                eventApi?.element?.className ===
                                                  "c-cptn__link"
                                            );
                                          };
                                          editor?.on(
                                            "NodeChange",
                                            editorEventCallback
                                          );
                                          return () => {
                                            editor?.off(
                                              "NodeChange",
                                              editorEventCallback
                                            );
                                          };
                                        },
                                        disabled: !isAllowedToViewImageList,
                                        // selector: "figure",
                                        // attributes: { disabled: "disabled" },
                                      }
                                    );

                                    // editor.ui.registry.addMenuButton(
                                    //   "listInsert",
                                    //   {
                                    //     text: "Insert",
                                    //     fetch: function (callback) {
                                    //       const items = [
                                    //         {
                                    //           type: "menuitem",
                                    //           text: "Gallery",
                                    //         },
                                    //         {
                                    //           type: "menuitem",
                                    //           text: "Survey",
                                    //         },
                                    //         {
                                    //           type: "menuitem",
                                    //           text: "Image Flip",
                                    //         },

                                    //         {
                                    //           type: "menuitem",
                                    //           text: "Video",
                                    //         },
                                    //         {
                                    //           type: "menuitem",
                                    //           text: "SNS Post",
                                    //         },
                                    //         {
                                    //           type: "menuitem",
                                    //           text: "Recommended Articles",
                                    //         },
                                    //         {
                                    //           type: "menuitem",
                                    //           text: "Custom Button",
                                    //         },
                                    //         {
                                    //           type: "menuitem",
                                    //           text: "Article Link",
                                    //         },
                                    //         {
                                    //           type: "menuitem",
                                    //           text: "K-Loka",
                                    //         },
                                    //         {
                                    //           type: "menuitem",
                                    //           text: "MREC Discov - Video",
                                    //         },
                                    //       ];
                                    //       callback(items);
                                    //     },
                                    //   }
                                    // );
                                  },
                                }}
                              />
                              <CFormText className="help-block">
                                <p>
                                  &#9432; &nbsp; Width is optimized to actual
                                  desktop screen content area of 720px.
                                </p>
                              </CFormText>
                            </div>
                          </div>
                        </div>
                      </CCol>
                    </CRow>
                    <CRow className="mb-3">
                      <CCol sm="12" className="mb-3">
                        <h4>Visible Tags</h4>
                        {isAllowedToCreateTag ? (
                          <CreatableSelect
                            isMulti
                            value={articleState.tags}
                            onChange={(event) =>
                              handleChangeArticle("tags", event)
                            }
                            className="basic-single font-weight-bold"
                            classNamePrefix="select"
                            isClearable={false}
                            isSearchable={true}
                            options={tagOptions}
                            openMenuOnClick={false}
                            // formatCreateLabel={(inputValue) => `${inputValue}`}
                            noOptionsMessage={() => null}
                            isDisabled={isEdit && !isAllowedToEdit}
                            components={{
                              Option: IconOption,
                              DropdownIndicator: () => null,
                              IndicatorSeparator: () => null,
                            }}
                            onInputChange={(input) => {
                              if (isNotEmptyString(input)) {
                                setShowDropdown(true);
                                setTagOptions((old) => {
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
                                setShowDropdown(false);
                                setTagOptions([]);
                              }
                            }}
                            placeholder="Add a visible tag to this article"
                            isLoading={isLoadingTag}
                            onCreateOption={(inputValue) =>
                              handleCreateNewTag(inputValue)
                            }
                          />
                        ) : (
                          <Select
                            isMulti
                            value={articleState.tags}
                            onChange={(event) =>
                              handleChangeArticle("tags", event)
                            }
                            className="basic-single font-weight-bold"
                            classNamePrefix="select"
                            isClearable={false}
                            isSearchable={true}
                            options={tagOptions}
                            openMenuOnClick={false}
                            // formatCreateLabel={(inputValue) => `${inputValue}`}
                            noOptionsMessage={() =>
                              showDropdown ? "No Tags found" : null
                            }
                            isDisabled={isEdit && !isAllowedToEdit}
                            components={{
                              Option: IconOption,
                              DropdownIndicator: () => null,
                              IndicatorSeparator: () => null,
                            }}
                            onInputChange={(input) => {
                              if (isNotEmptyString(input)) {
                                setShowDropdown(true);
                                setTagOptions((old) => {
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
                                setShowDropdown(false);
                                setTagOptions([]);
                              }
                            }}
                            placeholder="Add a visible tag to this article"
                            isLoading={isLoadingTag}
                          />
                        )}
                      </CCol>
                      <CCol sm="12">
                        <CFormText className="help-block">
                          <p>
                            &#9432; &nbsp; Use tags to specify a topic, person,
                            brand, institution, or an event included in your
                            article. Avoid duplicating or restating words as it
                            doesn't help in organizing content.
                          </p>
                        </CFormText>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol sm="6">
                        <div className="overflow-hidden">
                          <h4 className="float-left">Article Image</h4>
                          <span className="text-danger float-right small">
                            <i>Required!</i>
                          </span>
                        </div>
                      </CCol>
                    </CRow>
                    <CRow className="mb-3">
                      <CCol sm="12">
                        <CRow>
                          <CCol lg="6">
                            <CButton
                              onClick={() => setModalAddMainImage(true)}
                              className="d-block mb-2 p-3"
                              style={{ width: "100%" }}
                              color="success"
                              disabled={
                                !isAllowedToViewImageList ||
                                (isEdit && !isAllowedToEdit)
                              }
                            >
                              <i
                                className="material-icons -align-bottom mr-3"
                                style={{ fontSize: "0.875rem" }}
                              >
                                add
                              </i>
                              Add Main Image
                            </CButton>
                          </CCol>
                          <CCol lg="2" style={{ margin: "auto 0" }}>
                            <div
                              className="d-flex p-2 mb-2"
                              style={{
                                justifyContent: "space-between",
                                backgroundColor: "#e1e1e1",
                                borderRadius: "5px",
                              }}
                            >
                              <p className="my-auto">Display?</p>
                              <CSwitch
                                disabled={isEdit && !isAllowedToEdit}
                                style={{ margin: "auto 0" }}
                                size="sm"
                                color="success"
                                labelOff="OFF"
                                labelOn="ON"
                                checked={
                                  articleState.display_image.toString() === "1"
                                    ? true
                                    : false
                                }
                                onChange={() =>
                                  handleChangeArticle(
                                    "display_image",
                                    articleState.display_image.toString() ===
                                      "1"
                                      ? "0"
                                      : "1"
                                  )
                                }
                              />
                            </div>
                          </CCol>
                        </CRow>
                      </CCol>
                      <CCol sm="12" className="mb-3">
                        <CFormText className="help-block">
                          <p>
                            &#9432; &nbsp; A main image (1200px x 675px) serves
                            as a visual representation of your article. It
                            appears on social media when your article is shared.
                          </p>
                        </CFormText>
                      </CCol>
                      <CCol sm="12" className="main-image-container">
                        {(articleState.image_path ||
                          articleState.image_path !== "") && (
                          <img
                            src={articleState.image_path}
                            alt={articleState.image_path}
                          />
                        )}
                      </CCol>
                    </CRow>
                    <hr className="text-secondary" />
                    <CRow>
                      <CCol sm="6">
                        <div className="overflow-hidden">
                          <h4 className="float-left">Author</h4>
                          <span className="text-danger float-right small">
                            <i>Required!</i>
                          </span>
                        </div>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol sm="12">
                        <CRow>
                          <CCol lg="6">
                            <Select
                              isMulti
                              isClearable={true}
                              isSearchable={true}
                              required
                              className="font-weight-bold"
                              value={articleState.authors}
                              onInputChange={(input) => {
                                if (isNotEmptyString(input)) {
                                  setShowDropdown(true);
                                  setAuthorOps((old) => {
                                    let filteredData = [];
                                    filteredData = authorOps1.filter((data) => {
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
                                  setShowDropdown(false);
                                  setAuthorOps([]);
                                }
                              }}
                              onChange={(event) => {
                                setArticleState({
                                  ...articleState,
                                  authors: event,
                                  display_author: 1,
                                });
                              }}
                              noOptionsMessage={() =>
                                showDropdown ? "No Authors found" : null
                              }
                              options={authorOps}
                              isDisabled={isEdit && !isAllowedToEdit}
                              openMenuOnClick={false}
                              components={{
                                DropdownIndicator: () => null,
                                IndicatorSeparator: () => null,
                              }}
                              placeholder="Search by Author Name"
                            />
                            <CFormText className="help-block">
                              <p>
                                &#9432; &nbsp; You can add multiple authors by
                                selecting their names from the field above.
                              </p>
                            </CFormText>
                          </CCol>
                          <CCol lg="2">
                            <div
                              className="d-flex p-2"
                              style={{
                                justifyContent: "space-between",
                                backgroundColor: "#e1e1e1",
                                borderRadius: "5px",
                              }}
                            >
                              <span className="d-flex my-auto">Display?</span>
                              <CSwitch
                                disabled={isEdit && !isAllowedToEdit}
                                size="sm"
                                color="success"
                                labelOff="OFF"
                                labelOn="ON"
                                checked={
                                  articleState.display_author === 1
                                    ? true
                                    : false
                                }
                                onChange={() =>
                                  handleChangeArticle(
                                    "display_author",
                                    articleState.display_author === 1 ? 0 : 1
                                  )
                                }
                              />
                            </div>
                          </CCol>
                        </CRow>
                      </CCol>
                    </CRow>
                  </React.Fragment>
                </CCardBody>
              </CCard>
            )}
          </CContainer>
          <ImageLibraryModal
            addToContent={(image) =>
              setArticleState({
                ...articleState,
                image_path: image.path,
                display_image: "1",
                image_id: image.image_id?.toString(),
              })
            }
            data={imageList}
            selectImage
            show={modalAddMainImage}
            onClose={() => {
              setModalAddMainImage(false);
              setSearchText("");
            }}
            onChangeSearch={(e) => setSearchText(e.target.value)}
            searchValue={searchText}
          />
          <ImageLibraryModal
            addToContent={(image) => {
              // setArticleState({
              //   ...articleState,
              //   body_content: `
              //       <img src=${image.path} alt='selected-image'> ${articleState.body_content}
              //     `,
              // })
              handleAddImage(image);
            }}
            data={imageList}
            selectImage
            show={modalAddMainImage2}
            onClose={() => {
              setModalAddMainImage2(false);
              setSearchText("");
            }}
            onChangeSearch={(e) => setSearchText(e.target.value)}
            searchValue={searchText}
          />
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
        </div>
        <TheFooter />
      </div>
    </>
  );
};

export default CreateArticle;
