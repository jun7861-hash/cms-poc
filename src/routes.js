import React from 'react';

const Articles = React.lazy(() => import('./pages/Article'));
const ArticlesForms = React.lazy(() => import('./pages/Article/forms'));
const Sections = React.lazy(() => import('./pages/Tools/sections'));
const SectionsForms = React.lazy(() => import('./pages/Tools/sections/forms'));
const Tags = React.lazy(() => import('./pages/Tools/tags/'));
const TagsForms = React.lazy(() => import('./pages/Tools/tags/forms'));
const UserManagement = React.lazy(() => import('./pages/Tools/users'));
const UserForm = React.lazy(() => import('./pages/Tools/users/forms/userForm'));
const RoleManagement = React.lazy(() => import('./pages/Tools/roles'));
const RoleForm = React.lazy(() => import('./pages/Tools/roles/forms/roleForm'));
const PermissionManagement = React.lazy(() => import('./pages/Permissions'));
const PermissionForm = React.lazy(() => import('./pages/Permissions/forms/permissionForm'));
const PreviewArticle = React.lazy(() => import('./pages/Article/preview'));

const routes = [
  { path: '/articles', name: 'Articles', component: Articles },
  { path: '/article/articleForm/:id', name: 'Articles', component: ArticlesForms },
  { path: '/article/articleForm/', name: 'Articles', component: ArticlesForms },
  { path: '/tools/sections', name: 'Sections', component: Sections },
  { path: '/tools/sectionForm/:id', name: 'Sections', component: SectionsForms },
  { path: '/tools/sectionForm/', name: 'Sections', component: SectionsForms },
  { path: '/tools/tags', name: 'Tags', component: Tags },
  { path: '/tools/tagForm/:id', name: 'Tags', component: TagsForms },
  { path: '/tools/tagForm', name: 'Tags', component: TagsForms },
  { path: '/tools/users', name: 'User Management', component: UserManagement },
  { path: '/tools/user-form/:id', name: 'User Form', component: UserForm },
  { path: '/tools/user-form', name: 'User Form', component: UserForm },
  { path: '/tools/roles', name: 'Role Management', component: RoleManagement },
  { path: '/tools/role-form/:id', name: 'Role Form', component: RoleForm },
  { path: '/tools/role-form/', name: 'Role Form', component: RoleForm },
  { path: '/permissions', name: 'Permission Management', component: PermissionManagement },
  { path: '/permissionForm', name: 'Permission Form', component: PermissionForm },
  { path: '/permissionForm/:id', name: 'Permission Form', component: PermissionForm },
  { path: '/preview/:id', name: 'Preview Article', component: PreviewArticle },
];

export default routes;
