/* eslint-disable no-lone-blocks */
import React, { useEffect } from "react";
import { CRow, CCol, CButton } from "@coreui/react";
import { useTable, usePagination, useRowSelect, useSortBy } from "react-table";
import IndeterminateCheckbox from "./indeterminate";
import "./style.scss";
import useCurrentPage from "./pagination";

const TableGrid = ({
  columns,
  data,
  loading,
  checkbox,
  setSelectedRows,
  noDataText,
  pagination = true,
}) => {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page
    // The rest of these things are super handy, too ;)
    // pageOptions,
    // pageCount,
    setPageSize,
    canNextPage,
    canPreviousPage,
    nextPage,
    previousPage,
    selectedFlatRows,
    setHiddenColumns,
    state: { pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: pagination ? 30 : data?.length,
        hiddenColumns: [],
      },
    },
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      {
        checkbox &&
          hooks.visibleColumns.push((columns) => [
            // Let's make a column for selection
            {
              id: "selection",
              width: "10px",
              // The header can use the table's getToggleAllRowsSelectedProps method
              // to render a checkbox
              Header: ({ getToggleAllRowsSelectedProps }) => (
                <div className="d-inline">
                  <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
                </div>
              ),
              // The cell can use the individual row's getToggleRowSelectedProps method
              // to the render a checkbox
              Cell: ({ row }) => (
                <div className="d-inline">
                  <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
                </div>
              ),
            },
            ...columns,
          ]);
      }
    }
  );
  useEffect(() => {
    if (setSelectedRows) {
      const selected = selectedFlatRows.map((row) => row.original);
      setSelectedRows(selected);
    }
  }, [selectedFlatRows, setSelectedRows]);

  useEffect(() => {
    checkbox ? setHiddenColumns([]) : setHiddenColumns(["selection"]);
  }, [checkbox, setHiddenColumns]);
  // Render the UI for your table

  const [currenPageRows, setCurrentPageRows, changeLimit] = useCurrentPage(
    pageSize,
    1,
    data?.length
  );

  return (
    <>
      <table {...getTableProps()} className="table table-hover">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th width={column.width} {...column.getHeaderProps()}>
                  {column.render("Header")}
                  {/* Add a sort direction indicator */}
                  {/* <p className='material-icons mb-0 ml-2' style={{fontSize: '13px'}}>
                  {column.isSorted
                    ? column.isSortedDesc
                      ? ' arrow_downward'
                      : ' arrow_upward'
                    : ''}
                </p> */}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page?.length > 0 ? (
            page.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    );
                  })}
                </tr>
              );
            })
          ) : (
            <tr>
              <td className="text-center">{noDataText || "No data"}</td>
            </tr>
          )}
        </tbody>
      </table>
      {pagination && (
        <CRow
          style={{
            marginTop: data?.length > pageSize?.perPage ? "-50px" : "0",
          }}
        >
          <CCol
            md="6"
            className="d-flex justify-content-lg-start justify-content-center mb-3 px-2"
          >
            <div className="d-flex">
              <CRow className="mx-0">
                <CCol className="d-flex px-0">
                  <CButton
                    onClick={() => {
                      setPageSize(30);
                      changeLimit(30);
                    }}
                    variant="ghost"
                    type="button"
                    color="info"
                    disabled={pageSize === 30}
                  >
                    30
                  </CButton>
                </CCol>
                <CCol className="d-flex px-0">
                  <CButton
                    onClick={() => {
                      setPageSize(60);
                      changeLimit(60);
                    }}
                    variant="ghost"
                    type="button"
                    color="info"
                    disabled={pageSize === 60}
                  >
                    60
                  </CButton>
                </CCol>
                <CCol className="d-flex px-0">
                  <CButton
                    onClick={() => {
                      setPageSize(90);
                      changeLimit(90);
                    }}
                    variant="ghost"
                    type="button"
                    color="info"
                    disabled={pageSize === 90}
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
            className="d-flex justify-content-lg-end justify-content-center mb-3 px-2"
          >
            <div className="d-flex align-items-center">
              <p className="mr-2 mb-0">
                <span className="font-weight-bold">{currenPageRows}</span>{" "}
                &nbsp;of&nbsp;
                <span className="font-weight-bold">{data?.length}</span>
              </p>
              <CButton
                className="d-flex border"
                disabled={!canPreviousPage}
                onClick={() => {
                  previousPage();
                  setCurrentPageRows("previous");
                }}
              >
                <span className="material-icons">keyboard_arrow_left</span>
              </CButton>
              <CButton
                className="ml-2 d-flex border"
                onClick={() => {
                  nextPage();
                  setCurrentPageRows("next");
                }}
                disabled={!canNextPage}
              >
                <span className="material-icons">keyboard_arrow_right</span>
              </CButton>
            </div>
          </CCol>
        </CRow>
      )}
    </>
  );
};
export default TableGrid;
