import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import RightModal from "../../../components/right-modal";
import TableGrid from "../../../components/table-grid";
import { getArticleHistoryById } from "core/services/article";
import { parseDate } from "core/helpers";
import { CSpinner } from "@coreui/react";

const HistoryModal = ({ historyModal, toggleModal, articleData }) => {
  // eslint-disable-next-line
  const [isHandling, setIsHandling] = useState();
  const [historyList, setHistoryList] = useState([])

  const columns = [
    {
      Header: "Activity",
      accessor: "activity",
    },
    {
      Header: "Date",
      accessor: "updated_at",
      Cell: (item) => parseDate(item.value,'MMM DD,YYYY hh:mm a')
    },
    {
      Header: "By",
      accessor: "user",
    },
  ];

  // load article history by id
  const loadArticleHistory = async () => {
    setIsHandling(true);
    const res = await getArticleHistoryById(articleData.article_id);
    setHistoryList(res)
    setIsHandling(false);
  };

  //life cycles
  useEffect(() => {
    loadArticleHistory();
  }, []); //eslint-disable-line

  return (
    <>
      <RightModal
        show={historyModal}
        onClose={() => toggleModal("historyModal")}
        hasSaveButton={false}
        size="lg"
        closeButton
      >
        {isHandling ? (
          <CSpinner color="secondary" />
        ) : (
          <div className="pb-5">
            <div className="text-center">
              <h4>{articleData.title}</h4>
              <p>
                by <span className="secondary">{articleData.authors.map((item) => item.author).join(", ")}</span>
              </p>
            </div>
            <TableGrid columns={columns} data={historyList} pagination={false} />
            <p>
              Note: Should you need data older than 6 months for this article,
              please email the{" "}
              <span className="font-weight-bold">Tech Support</span> team at{" "}
              <a href="mailto:support@summitmedia.zendesk.com">
                support@summitmedia.zendesk.com
              </a>
            </p>
          </div>
        )}
      </RightModal>
    </>
  );
};

export default HistoryModal;
