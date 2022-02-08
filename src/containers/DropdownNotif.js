import React from 'react'
import {
  CBadge,
  CDropdown,
  // CDropdownItem,
  // CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

const DropdownNotif = () => {
  const itemsCount = 5
  return (
    <CDropdown
      inNav
      className="c-header-nav-item mx-2"
    >
      <CDropdownToggle className="c-header-nav-link" caret={false}>
        <CIcon name="cil-bell"/>
        <CBadge shape="pill" color="danger">{itemsCount}</CBadge>
      </CDropdownToggle>
      {/* <CDropdownMenu  placement="bottom-end" className="pt-0">
        <CDropdownItem
          header
          tag="div"
          className="text-center"
          color="light"
        >
          <strong>Notifications</strong>
        </CDropdownItem>
        <CDropdownItem>
          <span className="material-icons mr-1">article</span>
          <CDropdownItem
            header
            tag="div"
            className="text-center text-dark p-2"
          >
            <span className="font-weight-bold">Juan Dela Cruz</span> published <span className="font-weight-bold">article News</span>
          </CDropdownItem>
          <small>Friday, January 29th</small>
        </CDropdownItem>
        <CDropdownItem>
          <span className="material-icons mr-1">article</span>
          <CDropdownItem
            header
            tag="div"
            className="text-center text-dark p-2"
          >
            <span className="font-weight-bold">Juan Dela Cruz</span> published <span className="font-weight-bold">article News</span>
          </CDropdownItem>
          <small>Friday, January 29th</small>
        </CDropdownItem>
        <CDropdownItem>
          <span className="material-icons mr-1">article</span>
          <CDropdownItem
            header
            tag="div"
            className="text-center text-dark p-2"
          >
            <span className="font-weight-bold">Juan Dela Cruz</span> published <span className="font-weight-bold">article News</span>
          </CDropdownItem>
          <small>Friday, January 29th</small>
        </CDropdownItem>
        <CDropdownItem>
          <span className="material-icons mr-1">article</span>
          <CDropdownItem
            header
            tag="div"
            className="text-center text-dark p-2"
          >
            <span className="font-weight-bold">Juan Dela Cruz</span> published <span className="font-weight-bold">article News</span>
          </CDropdownItem>
          <small>Friday, January 29th</small>
        </CDropdownItem>
        <CDropdownItem>
          <span className="material-icons mr-1">article</span>
          <CDropdownItem
            header
            tag="div"
            className="text-center text-dark p-2"
          >
            <span className="font-weight-bold">Juan Dela Cruz</span> published <span className="font-weight-bold">article News</span>
          </CDropdownItem>
          <small>Friday, January 29th</small>
        </CDropdownItem>
        <CDropdownItem>
          <span className="material-icons mr-1">article</span>
          <CDropdownItem
            header
            tag="div"
            className="text-center text-dark p-2"
          >
            <span className="font-weight-bold">Juan Dela Cruz</span> published <span className="font-weight-bold">article News</span>
          </CDropdownItem>
          <small>Friday, January 29th</small>
        </CDropdownItem>
        <CDropdownItem>
          <span className="material-icons mr-1">article</span>
          <CDropdownItem
            header
            tag="div"
            className="text-center text-dark p-2"
          >
            <span className="font-weight-bold">Juan Dela Cruz</span> published <span className="font-weight-bold">article News</span>
          </CDropdownItem>
          <small>Friday, January 29th</small>
        </CDropdownItem>
      </CDropdownMenu> */}
    </CDropdown>
  )
}

export default DropdownNotif