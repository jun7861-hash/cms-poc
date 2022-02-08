import React from 'react'
import { CDataTable } from '@coreui/react'
import RightModal from '../../../components/RightModal'

const ArticleInsightsModal = ({insightsModal, toggleModal, data}) => {
  const fields = [
    { key: 'metric', label: 'Metric'},
    { key: 'this_month', label: 'This Month' },
    { key: 'vs_section', label: 'Vs. Section' },
    { key: 'vs_site', label: 'Vs. Site' },
    { key: 'all_time', label: 'All Time' },
  ]
  return (
    <>
      <RightModal
        show={insightsModal}
        onClose={() => toggleModal('insightsModal')}
        title="Article Insights"
        size="lg"
        closeButton
        // closeText="Cancel and go back to dashboard"
        // callbackText="Continue and push notification in this article"
        // onCallback={() => console.log("ok")}
      >
        <div className="text-center">
          <h4>Cosmo sample title</h4>
          <p>by: <span className="secondary">Juan Dela Cruz</span></p>
        </div>
        <CDataTable
          items={data}
          fields={fields}
          itemsPerPage={5}
          pagination
          border
          hover
        />
        <table className="table table-bordered mt-2">
          <tr>
            <td>Total Content Cost</td>
            <td>₱ 0</td>
          </tr>
          <tr>
            <td>Contributors</td>
            <td>none</td>
          </tr>
        </table>
      </RightModal>
    </>
  )
}

export default ArticleInsightsModal
