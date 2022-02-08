import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CSpinner,
} from "@coreui/react";
import { getArticleById } from "core/services/article";

const PreviewArticle = () => {
  const location = useLocation();
  const [isHandling, setIsHandling] = useState(false);
  const [articleData, setArticleData] = useState({});

  const articleId = location.pathname.substring(9, location.pathname.length);
  const loadData = async (articleId) => {
    setIsHandling(true);
    const response = await getArticleById(articleId);
    setArticleData(response.data);
    setIsHandling(false);
  };

  useEffect(() => {
    loadData(articleId);
    // eslint-disable-next-line
  }, []);

  return (
    <>
      {
        isHandling ? (
          <CSpinner color="secondary" />
        ) : (
          <>
            <CContainer>
              <CCard>
                <CCardHeader>
                  <h1>Cosmo</h1>
                </CCardHeader>
                <CCardBody>
                  <h4 className="text-center">{articleData.title}</h4>
                  <CRow>
                    <CCol className="mb-2" sm="12">
                      <p>slug: {articleData.slug}</p>
                    </CCol>
                    <CCol className="mb-2" sm="12">
                      <p>blurb: {articleData.blurb}</p>
                    </CCol>
                    <CCol className="mb-3" sm="12">
                      <p className="mb-0">Body content:</p>
                      <div>{articleData.body_content}</div>
                    </CCol>
                    <CCol className="mb-2" sm="12">
                      <p>section name: {articleData.section_name}</p>
                    </CCol>
                  </CRow>
                </CCardBody>
              </CCard>
            </CContainer>
          </>
        )
      }
    </>
  );
};

export default PreviewArticle;
