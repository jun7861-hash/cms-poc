import React, { useState, useEffect } from 'react'
import RightModal from 'components/right-modal'
import TableGrid from 'components/table-grid'
import { parseDate } from 'core/helpers'

const ViewArticlesModal = ({
  show,
  toggle,
  articlesBySectionId
}) => {

  const [data, setData] = useState(articlesBySectionId)

  useEffect(() => {
    setData(articlesBySectionId)
  }, [articlesBySectionId])
  
  const columns = React.useMemo(
    () => [
      {
        Header: 'ID',
        accessor: 'article_id',
      },
      {
        Header: 'Article Title',
        accessor: 'title',
      },
      {
        Header: 'Publish Date',
        accessor: 'published_date',
        Cell: ({ cell }) => {
          if (cell.value !== '') {
            return (
              <div className='text-center'>
                <span>{parseDate(cell.value,'MM/DD/YYYY')}</span>
              </div>
            )
          } else {
            return ''
          }
        }
      },
      {
        Header: 'Preview',
        accessor: 'preview',
        Cell: ({ cell }) => (
          <div className='text-center'>
            <i className="material-icons text-secondary p-2">visibility</i>
          </div>
        )
      },
    ], [],
  );

  const tableData = React.useMemo(
    () => data, [data],
  );

  return (
    <React.Fragment>
      <RightModal
        show={show}
        onClose={() => toggle()}
        hasSaveButton={false}
        closeButton
      >
        <p className="text-right font-weight-bold mb-2">Total number of Articles: {tableData?.length}</p>
        <TableGrid 
          columns={columns}
          data={tableData?.length > 0 ? tableData : []}
          noDataText="No Articles found."
        />
      </RightModal>
    </React.Fragment>
  )
}

export default ViewArticlesModal
