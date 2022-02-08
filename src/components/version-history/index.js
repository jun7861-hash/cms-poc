import React, { useState, useEffect } from "react";
import RightModal from "../right-modal";
import {
  CSpinner,
  CTabs,
  CNavItem,
  CNav,
  CNavLink,
  CTabContent,
  CTabPane,
} from "@coreui/react";
import {
  getVersionHistoryById,
  editArticle,
  getArticleById,
} from "core/services/article";
import { isNotEmptyObject, parseDate, removeSaveNotifId } from "core/helpers";
import "./style.scss";

const VersionHistoryModal = ({
  /* pre prop */
  innerRef,
  show,
  centered,
  backdrop,
  color,
  borderColor,
  onOpened,
  onClosed,
  fade = true,
  onClose,
  article,
}) => {
  const [versionData, setVersionData] = useState([]);
  const [isHandling, setIsHandling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("auto-save");
  const [articleData, setArticleData] = useState([]);

  useEffect(() => {
    loadData();
  }, []); /*eslint-disable-line*/

  const loadData = async () => {
    setIsHandling(true);
    const res_v = await getVersionHistoryById(article.article_id);
    const res_a = await getArticleById(article.article_id);
    if (
      res_v &&
      res_a?.data &&
      isNotEmptyObject(res_v) &&
      isNotEmptyObject(res_a?.data)
    ) {
      setVersionData(res_v);
      setArticleData(res_a.data);
    }
    setIsHandling(false);
  };

  const isCreatedArticle = articleData?.created_at === articleData?.updated_at;
  // save version history
  const handleSave = async () => {
    setIsSaving(true);
    removeSaveNotifId(articleData.article_id)
    const dataSource = activeTab === "auto-save" ? versionData : articleData;
    const tags = dataSource.tags?.map((tag) => {
        if (activeTab === "auto-save") {
          return {
            tag_id: tag.tag_id,
            tag_name: tag.tag_name,
          };
        } else {
          return {
            tag_id: tag.tag_id,
            tag_name: tag.tag,
          };
        }
      });
    const authors = dataSource.authors?.map((item) => {
      if (activeTab === "auto-save") {
        return {
          author_id: item.author_id,
          author_name: item.author_name,
        };
      } else {
        return {
          author_id: item.author_id,
          author_name: item.author,
        };
      }
    });
    const payload = {
      title: dataSource.title,
      section_id: dataSource.section_id,
      section_name: dataSource.section_name,
      slug: dataSource.slug,
      url: dataSource.url,
      blurb: dataSource.blurb,
      body_content: dataSource.body_content,
      display_author: dataSource.display_author,
      image_path: dataSource.image_path,
      tags: tags,
      authors: authors,
      locked_by: 0,
      locked_by_name: "",
      auto_save: 0,
      auto_save_by: 0,
      auto_save_by_name: "",
      autosave: "0",
      display_image: dataSource.display_image,
      with_log: "1"
    };
    let res;
    res = await editArticle(payload, articleData.article_id);
    if (res?.successful) {
      window.location.href = `/article/articleForm/${articleData.article_id}`;
    }
    setIsSaving(false);
  };

  return (
    <>
      <RightModal
        show={show}
        onClose={onClose}
        className="mb-3 version-history-modal"
        innerRef={innerRef}
        centered={centered}
        size="lg"
        backdrop={backdrop}
        color={color}
        borderColor={borderColor}
        onOpened={onOpened}
        onClosed={onClosed}
        fade={fade}
        saveButton="Select this version"
        footer
        handleSave={() => handleSave()}
        saveColor="success"
        isLoading={isSaving}
      >
        {isHandling ? (
          <CSpinner color="secondary" />
        ) : (
          <div className="px-4 pb-5">
            <h4 className="mb-4 font-weight-normal text-center">
              This article was not closed properly. Please choose a version
              below to continue editing this article.
            </h4>
            <CTabs
              activeTab={activeTab}
              onActiveTabChange={(tab) => setActiveTab(tab)}
            >
              <CNav variant="tabs" className="mb-4">
                <CNavItem>
                  <CNavLink data-tab="auto-save">
                    Auto Saved -{" "}
                    <i>
                      {parseDate(versionData.updated_at, "MMM DD,YYYY hh:mm a")}
                    </i>
                  </CNavLink>
                </CNavItem>
                {!isCreatedArticle && (
                  <CNavItem>
                    <CNavLink data-tab="previously-save">
                      Previously Saved
                    </CNavLink>
                  </CNavItem>
                )}
              </CNav>
              <CTabContent>
                <CTabPane data-tab="auto-save">
                  <table className="table table-bordered w-100">
                    <tbody>
                      <tr>
                        <td className="w-20">Title</td>
                        <td className="w-80">
                          {versionData && versionData?.title}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-20">URL</td>
                        <td className="w-80">
                          {versionData && versionData?.url}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-20">Blurb</td>
                        <td className="w-80">
                          {versionData && versionData?.blurb}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-20">Tags</td>
                        <td className="w-80">
                          {versionData &&
                            versionData?.tags
                              ?.map((item) => item.tag_name)
                              .join(", ")}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-20">Article Main Image</td>
                        <td className="w-80">
                          {versionData && versionData?.image_path && (
                            <React.Fragment>
                              <img src={versionData?.image_path} alt="" />{" "}
                              <br />
                              {versionData?.image_path}
                            </React.Fragment>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-20">Author</td>
                        <td className="w-80">
                          {versionData &&
                            versionData.authors
                              ?.map((item) => item.author_name)
                              .join(", ")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CTabPane>
                <CTabPane data-tab="previously-save">
                  <table className="table table-bordered w-100">
                    <tbody>
                      <tr>
                        <td className="w-20">Title</td>
                        <td className="w-80">
                          {articleData && articleData?.title}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-20">URL</td>
                        <td className="w-80">
                          {articleData && articleData?.url}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-20">Blurb</td>
                        <td className="w-80">
                          {articleData && articleData?.blurb}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-20">Tags</td>
                        <td className="w-80">
                          {articleData &&
                            articleData?.tags
                              ?.map((item) => item.tag)
                              .join(", ")}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-20">Article Main Image</td>
                        <td className="w-80">
                          {articleData && articleData?.image_path && (
                            <React.Fragment>
                              <img src={articleData?.image_path} alt="" />{" "}
                              <br />
                              {articleData?.image_path}
                            </React.Fragment>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-20">Author</td>
                        <td className="w-80">
                          {articleData &&
                            articleData.authors
                              ?.map((item) => item.author)
                              .join(", ")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CTabPane>
              </CTabContent>
            </CTabs>
          </div>
        )}
      </RightModal>
    </>
  );
};

export default VersionHistoryModal;
