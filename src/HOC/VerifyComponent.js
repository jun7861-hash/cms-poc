import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { matchPath } from "react-router-dom";
import { CSpinner } from "@coreui/react";
import { isNotEmptyArray } from "core/helpers";
import * as masterActions from "store/master/actions";

const VerifyComponent = ({ WrappedComponent, ...rest }) => {
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("userInfo"));
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (user?.permissions) {
      setPermissions(user?.permissions);
      dispatch(masterActions.updateUserPermission(user?.permissions));
    }
  }, []); /*eslint-disable-line*/

  const {
    location: { pathname },
  } = rest;

  /**
   * Check user's permission if allowed to enter specific path (url)
   * @param {string} pathname
   * @param {string} role_name
   * @param {array} permissions
   * @returns {boolean}
   */
  const checkPathByRole = (pathname, role_name, permissions) => {
    switch (pathname) {
      case "/":
        return true;
      case "/articles":
        return permissions.includes("Article.List");
      case "/article/articleForm":
        return permissions.includes("Article.Create");
      case "/article/articleForm/":
        return permissions.includes("Article.Create");
      case "/tools/tags":
        return permissions.includes("Tag.List");
      case "/tools/tagForm":
        return permissions.includes("Tag.Create");
      case "/tools/tagForm/":
        return permissions.includes("Tag.Create");
      case "/tools/sections":
        return permissions.includes("Section.List");
      case "/tools/sections/":
        return permissions.includes("Section.List");
      case "/tools/sectionForm/":
        return permissions.includes("Section.Create");
      case "/tools/sectionForm":
        return permissions.includes("Section.Create");
      case "/tools/users":
        return permissions.includes("User.List");
      case "/tools/user-form":
        return permissions.includes("User.Create");
      case "/tools/user-form/":
        return permissions.includes("User.Create");
      case "/tools/roles":
        return permissions.includes("Role.List");
      case "/tools/role-form":
        return permissions.includes("Role.Create");
      case "/tools/role-form/":
        return permissions.includes("Role.Create");
      case "/permissions":
        return (
          role_name?.toLowerCase() === "admin" ||
          role_name?.toLowerCase() === "technical admin" ||
          role_name?.toLowerCase() === "editorial admin"
        );
      case "/permissionForm":
        return (
          role_name?.toLowerCase() === "admin" ||
          role_name?.toLowerCase() === "technical admin" ||
          role_name?.toLowerCase() === "editorial admin"
        );
      default:
        if (!!matchPath(pathname, "/tools/sectionForm/:id")) {
          return permissions.includes("Section.View");
        } else if (!!matchPath(pathname, "/tools/role-form/:id")) {
          return permissions.includes("Role.View");
        } else if (!!matchPath(pathname, "/article/articleForm/:id")) {
          return (
            (permissions.includes("Article.View") &&
              permissions.includes("Article.Edit")) ||
            (permissions.includes("Article.View") &&
              permissions.includes("Article.Publish")) ||
            permissions.includes("Article.View")
          );
        } else if (!!matchPath(pathname, "/tools/tagForm/:id")) {
          return permissions.includes("Tag.View");
        } else if (!!matchPath(pathname, "/tools/user-form/:id")) {
          return permissions.includes("User.View");
        } else if (!!matchPath(pathname, "/preview/:id")) {
          return true;
        } else if (!!matchPath(pathname, "/permissionForm/:id")) {
          return (
            role_name?.toLowerCase() === "admin" ||
            role_name?.toLowerCase() === "technical admin" ||
            role_name?.toLowerCase() === "editorial admin"
          );
        } else {
          return false;
        }
    }
  };

  /**
   * handles component rendering base on user's permission
   * @param {array} permissions
   */
  const renderComponent = (permissions) => {
    if (isNotEmptyArray(permissions) && user?.role_name && pathname) {
      const isAllow = checkPathByRole(pathname, user?.role_name, permissions);
      if (isAllow) {
        return <WrappedComponent {...rest} />;
      } else {
        alert(`You don't have permission to access this page`);
        window.location.href = "/";
      }
    } else {
      return (
        <CSpinner color="secondary" size="lg" className="screen-loading" />
      );
    }
  };

  return <React.Fragment>{renderComponent(permissions)}</React.Fragment>;
};

export default VerifyComponent;
