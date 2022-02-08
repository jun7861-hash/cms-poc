import React, { useEffect } from 'react'
import {
  Route,
  Switch
} from 'react-router-dom'
import TheSidebar from 'containers/Sidebar'
import routes from 'routes'
import { isAuthenticated, signOut } from 'core/services/auth'

const ArticleForm = () => {
  useEffect(() => {
    if (!isAuthenticated()) {
      signOut()
    }
  }, [])
  return (
    <React.Fragment>
      <TheSidebar/>
      <Switch>
        {routes.map((route, idx) => {
          return route.component && (
            <Route
              key={idx}
              path={route.path}
              exact={route.exact}
              name={route.name}
              render={props => (
                <div className="c-wrapper">
                  <route.component {...props} />
                </div>
              )} />
          )
        })}
      </Switch>
    </React.Fragment>
  )
}

export default ArticleForm
