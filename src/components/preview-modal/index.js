import React from "react";
import RightModal from "../right-modal";
import {
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CTabs,
} from "@coreui/react";
import "./style.scss";

const PreviewModal = ({ previewModal, toggleModal, articleData }) => {
  return (
    <>
      <RightModal
        show={previewModal}
        onClose={() => toggleModal()}
        saveButton="Preview on full site"
        size="xl"
        closeButton
        handleSave={() => {
          window.open(
            `${window.location.origin}/preview/${articleData.article_id}`,
            "_blank"
          );
        }}
      >
        <React.Fragment>
          <CTabs activeTab="mobile">
            <CNav variant="tabs" className="d-flex justify-content-center">
              <CNavItem>
                <CNavLink data-tab="mobile">
                  <p
                    style={{ fontSize: "50px" }}
                    className="material-icons mb-0 w-100 text-center"
                  >
                    stay_primary_portrait
                  </p>
                  <p
                    className="mb-0 text-center"
                  >
                    Mobile View
                  </p>
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink data-tab="desktop">
                  <p
                    style={{ fontSize: "50px" }}
                    className="material-icons mb-0 w-100 text-center"
                  >
                    laptop
                  </p>
                  <p
                    className="mb-0 text-center"
                  >
                    Desktop View
                  </p>
                </CNavLink>
              </CNavItem>
              <CNavItem></CNavItem>
            </CNav>
            <CTabContent className="pb-5">
              <CTabPane data-tab="mobile">
                <div className="d-flex justify-content-center">
                  <div
                    className="preview-mobile embed-responsive embed-responsive-1by1"
                    style={{ height: "50vw" }}
                  >
                    <iframe
                      title="preview"
                      className="embed-responsive-item"
                      src={`${window.location.origin}/preview/${articleData.article_id}`}
                    ></iframe>
                  </div>
                </div>
              </CTabPane>
              <CTabPane data-tab="desktop">
                <div className="preview-desktop embed-responsive embed-responsive-1by1">
                  <iframe
                    title="preview"
                    className="embed-responsive-item"
                    src={`${window.location.origin}/preview/${articleData.article_id}`}
                  ></iframe>
                </div>
              </CTabPane>
            </CTabContent>
          </CTabs>
        </React.Fragment>
      </RightModal>
    </>
  );
};

export default PreviewModal;
