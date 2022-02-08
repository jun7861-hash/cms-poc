import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Loadable from 'react-loadable';
import './scss/style.scss';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import 'react-datepicker/dist/react-datepicker.css';
import * as masterActions from 'store/master/actions'
import { isAuthenticated } from 'core/services/auth'
import Loading from 'components/loading'
import VerifyComponent from 'HOC/VerifyComponent'


const App = () => {
  const dispatch = useDispatch();
  const website_type = localStorage.getItem('quill_type');
  useEffect(() => {
    const currentUser = localStorage.getItem('userInfo');
    if (currentUser !== null) {
      dispatch(masterActions.updateUser(JSON.parse(currentUser)))
    }
  }, []) /* eslint-disable-line */
  
  
  const loading = (
    <div className="pt-3 text-center">
      <div className="sk-spinner sk-spinner-pulse"></div>
    </div>
  )

  const Layout = Loadable({
    loader: () => import('./containers/Layout'),
    loading: Loading
  });
  const Login = Loadable({
    loader: () => import('./pages/Login'),
    loading: Loading
  });
  const ChangePassword = Loadable({
    loader: () => import('./pages/ChangePassword'),
    loading: Loading
  });
  const SetupPassword = Loadable({
    loader: () => import('./pages/SetupPassword'),
    loading: Loading
  });
  const ForgotPassword = Loadable({
    loader: () => import('./pages/ForgotPassword'),
    loading: Loading
  });
  const Profile = Loadable({
    loader: () => import('./pages/Profile'),
    loading: Loading
  });
  const NotFound = Loadable({
    loader: () => import('./containers/NotFound'),
    loading: Loading
  });
  const UAMRedirection = Loadable({
    loader: () => import('./pages/uam-signin'),
    loading: Loading
  });
  const PrivateRoute = ({ component, ...rest }) => (
    <Route {...rest} render={(props) => {
      if (isAuthenticated()) {
        return <VerifyComponent WrappedComponent={component}  {...props} />
      } else {
        if (website_type === 'uam') {
          window.location.href = 'http://staging.spotuam.summitmedia-digital.com/logout'
        } else if (website_type === 'stand_alone') {
          return (
            <Redirect to={{
              pathname: '/login',
              state: { from: props.location }
            }} />
          )
        } else {
          return (
            <Redirect to={{
              pathname: '/login',
              state: { from: props.location }
            }} />
          )
        }
      }
    }
  }/>
  )

  const PublicRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={(props) => {
      if (isAuthenticated()) {
        return (
          <Redirect to={{
            pathname: '/articles',
            state: { from: props.location }
          }} />
        )
      } else {
        return <Component {...props} />
      }
    }
  }/>
  )
  

  return (
    <Router>
      <React.Suspense fallback={loading}>
        <Switch>
          <Route exact path="/profile/:id" name="Profile" render={props => <Profile {...props}/>} />
          <Route path="/uam/signin" name="UAM Redirection" render={props => <UAMRedirection {...props}/>} />
          <PublicRoute exact path="/login" name="Login" component={Login} />
          <PublicRoute exact path="/forgot-password" name="Forgot Password" component={ForgotPassword} />
          <PublicRoute exact path="/change-password/:c" name="Change Password" component={ChangePassword} />
          <PublicRoute exact path="/setup-password/:c" name="Setup Password" component={SetupPassword} />
          <PrivateRoute exact path='/' component={Layout} />
          <PrivateRoute path='/articles' component={Layout} />
          <PrivateRoute path='/article/articleForm/:id' component={Layout} />
          <PrivateRoute path='/article/articleForm/' component={Layout} />
          <PrivateRoute path='/article/articleForm' component={Layout} />
          <PrivateRoute path='/tools/tagForm' component={Layout} />
          <PrivateRoute path='/tools/tagForm/:id' component={Layout} />
          <PrivateRoute path='/tools/sections' component={Layout} />
          <PrivateRoute path='/tools/sectionForm/' component={Layout} />
          <PrivateRoute path='/tools/sectionForm/:id' component={Layout} />
          <PrivateRoute path='/tools/tags' component={Layout} />
          <PrivateRoute path='/tools/curatedArticles' component={Layout} />
          <PrivateRoute path='/tools/surveyArchive' component={Layout} />
          <PrivateRoute path='/tools/videoTool' component={Layout} />
          <PrivateRoute path='/tools/magazineArchive' component={Layout} />
          <PrivateRoute path='/tools/users' component={Layout} />
          <PrivateRoute path='/tools/user-form' component={Layout} />
          <PrivateRoute path='/tools/user-form/:id' component={Layout} />
          <PrivateRoute path='/tools/roles' component={Layout} />
          <PrivateRoute path='/tools/role-form/:id' component={Layout} />
          <PrivateRoute path='/tools/role-form/' component={Layout} />
          <PrivateRoute path='/permissions' component={Layout} />
          <PrivateRoute path='/permissionForm' component={Layout} />
          <PrivateRoute path='/permissionForm/:id' component={Layout} />
          <PrivateRoute path='/preview/:id' component={Layout} />
          <Route component={NotFound} />
        </Switch>
      </React.Suspense>
    </Router>
  )
}

export default App;