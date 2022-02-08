import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CCreateElement,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarNavDivider,
  CSidebarNavTitle,
  CSidebarMinimizer,
  CSidebarNavDropdown,
  CSidebarNavItem,
} from "@coreui/react";

import CIcon from "@coreui/icons-react";
import * as actions from "../store/master/actions";

const TheSidebar = () => {
  const dispatch = useDispatch();
  const master = useSelector((state) => state.master);
  const [navItems, setNavItems] = useState([]);

  useEffect(() => {
    if (master.userPermissions) {
      const nav = [
        master.userPermissions.includes("Article.List")
          ? {
              _tag: "CSidebarNavItem",
              name: "Content",
              to: "/articles",
              icon: "cil-file",
            }
          : undefined,
        master.userPermissions.includes("Section.List") ||
        master.userPermissions.includes("Tag.List") ||
        master.userPermissions.includes("User.List") ||
        master.userPermissions.includes("Role.List") ||
        master.currentUser?.role_name?.toLowerCase() === "admin" ||
        master.currentUser?.role_name?.toLowerCase() === "technical admin" ||
        master.currentUser?.role_name?.toLowerCase() === "editorial admin"
          ? {
              _tag: "CSidebarNavDropdown",
              name: "Tools",
              route: "/tools",
              icon: "cil-settings",
              _children: [
                master.userPermissions.includes("Section.List")
                  ? {
                      _tag: "CSidebarNavItem",
                      name: "Sections",
                      to: "/tools/sections",
                    }
                  : undefined,
                master.userPermissions.includes("Tag.List")
                  ? {
                      _tag: "CSidebarNavItem",
                      name: "Tags",
                      to: "/tools/tags",
                    }
                  : undefined,
                master.userPermissions.includes("User.List")
                  ? {
                      _tag: "CSidebarNavItem",
                      name: "User Management  ",
                      to: "/tools/users",
                    }
                  : undefined,
                master.userPermissions.includes("Role.List")
                  ? {
                      _tag: "CSidebarNavItem",
                      name: "Roles",
                      to: "/tools/roles",
                    }
                  : undefined,
                master.currentUser?.role_name?.toLowerCase() === "admin" ||
                master.currentUser?.role_name?.toLowerCase() ===
                  "technical admin" ||
                master.currentUser?.role_name?.toLowerCase() ===
                  "editorial admin"
                  ? {
                      _tag: "CSidebarNavItem",
                      name: "Permissions",
                      to: "/permissions",
                    }
                  : undefined,
              ],
            }
          : undefined,
      ].filter((x) => x !== undefined);
      setNavItems(nav);
    }
  }, [master.userPermissions, master.currentUser]);

  useEffect(() => {
    function updateSize() {
      if (window.innerWidth <= 991) {
        dispatch(actions.toggleSidebar("responsive"));
      }
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []); /*eslint-disable-line*/

  return (
    <CSidebar
      style={{ zIndex: "1000" }}
      minimize
      show={master.sidebar}
      onShowChange={(val) => dispatch(actions.toggleSidebar(val))}
    >
      <CSidebarBrand className="d-md-down-none" to="/">
        <div>
          <CIcon
            className="c-sidebar-brand-full"
            name="logo-negative"
            height={35}
          />
          <CIcon
            className="c-sidebar-brand-minimized"
            name="sygnet"
            height={35}
          />
        </div>
      </CSidebarBrand>
      <CSidebarNav>
        <CCreateElement
          items={navItems}
          components={{
            CSidebarNavDivider,
            CSidebarNavDropdown,
            CSidebarNavItem,
            CSidebarNavTitle,
          }}
        />
      </CSidebarNav>
      <CSidebarMinimizer className="c-d-md-down-none" />
    </CSidebar>
  );
};

export default React.memo(TheSidebar);
