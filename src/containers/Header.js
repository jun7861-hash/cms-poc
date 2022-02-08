import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CHeader,
  CToggler,
  // CHeaderBrand,
  CHeaderNav,
  CButton,
  CLink,
  CBreadcrumb,
  CBreadcrumbItem,
  CSpinner,
} from "@coreui/react";
import { useLocation, matchPath } from "react-router-dom";
import { TheHeaderDropdown } from "./index";
import * as masterActions from "../store/master/actions";
import * as toolsActions from "store/tools/actions";
import { refreshTokenOnEnter } from "core/services/token";

const TheHeader = () => {
  const dispatch = useDispatch();
  const master = useSelector((state) => state.master);
  const breadCrumbs = useSelector((state) => state.tools.breadCrumbs);
  const userPermissions = useSelector((state) => state.master.userPermissions);
  const isAllowedToCreateSection = userPermissions.includes("Section.Create");
  const isAllowedToCreateTag = userPermissions.includes("Tag.Create");
  const isAllowedToCreateUser = userPermissions.includes("User.Create");
  const isAllowedToCreateArticle = userPermissions.includes("Article.Create");
  const isAllowedToCreateRole = userPermissions.includes("Role.Create");

  const [isLoading, setIsLoading] = useState(false);

  const toggleSidebar = () => {
    dispatch(masterActions.toggleSidebar(!master.sidebar));
  };

  const toggleSidebarMobile = () => {
    const val = [false, "responsive"].includes(master.sidebar)
      ? true
      : "responsive";
    dispatch(masterActions.toggleSidebar(val));
  };

  const location = useLocation();
  const isTagFormMatched = !!matchPath(location.pathname, "/tools/tagForm/:id");

  const isSectionFormMatched = !!matchPath(
    location.pathname,
    "/tools/sectionForm/:id"
  );

  const isRoleForm = !!matchPath(location.pathname, "/tools/role-form/:id");

  const isUserForm = !!matchPath(location.pathname, "/tools/user-form/:id");

  const redirectToContentForm = async () => {
    setIsLoading(true);
    await refreshTokenOnEnter();
    setIsLoading(false);
    window.location.href = "/article/articleForm";
  };

  return (
    <CHeader withSubheader>
      <div className="mr-auto d-flex">
        {location.pathname !== "/platform" &&
          location.pathname !== "/platformForm" &&
          location.pathname !== "/setupPlugin" &&
          location.pathname !== "/enableModule" && (
            <>
              <CToggler
                inHeader
                className="ml-md-3 d-lg-none float-left"
                onClick={toggleSidebarMobile}
              />
              <CToggler
                inHeader
                className="ml-1 d-md-down-none float-left"
                onClick={toggleSidebar}
                style={{ padding: "0.75rem 1rem" }}
              />
            </>
          )}
        {(location.pathname === "/tools/role-form" || isRoleForm) && (
          <CBreadcrumb className="float-left mb-0 border-bottom-0 d-flex align-items-center">
            <CBreadcrumbItem>
              <CLink to="/tools/roles">Roles</CLink>
            </CBreadcrumbItem>
            <CBreadcrumbItem active>
              {isRoleForm ? breadCrumbs?.role : "New Role"}
            </CBreadcrumbItem>
          </CBreadcrumb>
        )}
        {(location.pathname === "/tools/sectionForm/" ||
          isSectionFormMatched) && (
          <CBreadcrumb className="float-left mb-0 border-bottom-0 d-flex align-items-center">
            <CBreadcrumbItem>
              <CLink to="/tools/sections">Section</CLink>
            </CBreadcrumbItem>
            <CBreadcrumbItem active>
              {isSectionFormMatched ? breadCrumbs?.section : "New Section"}
            </CBreadcrumbItem>
          </CBreadcrumb>
        )}
        {(isUserForm ||
          location.pathname === "/tools/user-form" ||
          location.pathname === "/tools/user-form/") && (
          <CBreadcrumb className="float-left mb-0 border-bottom-0 d-flex align-items-center">
            <CBreadcrumbItem>
              <CLink to="/tools/users">Users</CLink>
            </CBreadcrumbItem>
            <CBreadcrumbItem active>
              {isUserForm ? breadCrumbs?.user : "New User"}
            </CBreadcrumbItem>
          </CBreadcrumb>
        )}
        {(location.pathname === "/tools/tagForm" || isTagFormMatched) && (
          <CBreadcrumb className="float-left mb-0 border-bottom-0 d-flex align-items-center">
            <CBreadcrumbItem>
              <CLink to="/tools/tags">Tag</CLink>
            </CBreadcrumbItem>
            <CBreadcrumbItem active>
              {isTagFormMatched ? breadCrumbs?.tags : "New Tag"}
            </CBreadcrumbItem>
          </CBreadcrumb>
        )}
        {/* <CHeaderBrand className="mx-auto d-lg-none" to="/">
          <CIcon name="logo" height="48" alt="Logo"/>
        </CHeaderBrand> */}
      </div>
      <CHeaderNav className="px-3 d-flex">
        {location.pathname === "/tools/sections" && isAllowedToCreateSection && (
          <CButton
            className="mx-2"
            size="md"
            to="/tools/sectionForm/"
            color="info"
          >
            + New Section
          </CButton>
        )}
        {location.pathname === "/tools/tags" && isAllowedToCreateTag && (
          <CButton
            className="mx-2"
            size="md"
            to="/tools/tagForm"
            color="info"
            onClick={() => dispatch(toolsActions.updateTagForm(null))}
          >
            + New Tag
          </CButton>
        )}
        {location.pathname === "/articles" && isAllowedToCreateArticle && (
          <CButton
            className="mx-2"
            color="info"
            size="md"
            onClick={() => redirectToContentForm()}
          >
            + New Article
            {isLoading && <CSpinner size="sm" color="secondary" className="ml-2" />}
          </CButton>
        )}
        {location.pathname === "/tools/users" && isAllowedToCreateUser && (
          <CButton
            color="info"
            className="mx-2"
            size="md"
            to="/tools/user-form"
          >
            + New User
          </CButton>
        )}
        {location.pathname === "/tools/roles" && isAllowedToCreateRole && (
          <CButton
            color="info"
            className="mx-2"
            size="md"
            to="/tools/role-form"
          >
            + New Role
          </CButton>
        )}
        {location.pathname === "/profile" && (
          <CButton className="d-flex mx-2" size="md" color="success">
            <p className="d-flex align-items-center material-icons m-0">save</p>
            &nbsp;Save
          </CButton>
        )}
        {location.pathname === "/articles/articleForm" && (
          <CButton className="d-flex mx-2" size="md" color="success">
            <p className="d-flex align-items-center material-icons m-0">save</p>
            &nbsp;Save
          </CButton>
        )}
        {/* <DropdownNotif/> */}
        <TheHeaderDropdown />
      </CHeaderNav>
    </CHeader>
  );
};

export default TheHeader;
