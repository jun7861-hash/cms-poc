import { useEffect, useState } from "react";

const useCurrentPage = (limitParam, pageParam, dataLength) => {
  const [limit, setLimit] = useState(limitParam);
  const computePage = () =>
    pageLimit > dataLength
      ? `${dataLength - lowerHandle + 1} - ${dataLength}`
      : `${pageLimit - limit + 1} - ${pageLimit}`;
  const [page, setPage] = useState(pageParam);
  const [pageDisplay, setPageDisplay] = useState(computePage());
  const pageLimit = limit * page;
  let lowerHandle = dataLength < limit ? dataLength - 1 : dataLength % limit;
  if (page === 1) {
    lowerHandle++;
  }
  const changeLimit = (newLimit) => {
    setLimit(newLimit);
  };

  const changePage = (direction) => {
    switch (direction) {
      case "next": {
        setPage((currentPage) => currentPage + 1);
        break;
      }
      case "previous": {
        setPage((currentPage) => currentPage - 1);
        break;
      }
      default: {
      }
    }
  };
  useEffect(() => {
    setPageDisplay(computePage());
  }, [page, limit]); /*eslint-disable-line*/
  return [pageDisplay, changePage, changeLimit];
};

export default useCurrentPage;
