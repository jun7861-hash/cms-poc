import React, { useState, useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Route, Switch, Redirect } from "react-router-dom";
import { CContainer, CAlert } from "@coreui/react";

// routes config
import routes from "../routes";

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

const TheContent = () => {
  const location = useLocation();
  const [sessionMessageTimer, setSessionMessageTimer] = useState(0);

  /**
   * Session message after success login
   * will disappear after 30secs
   */
  const timeTicker = () => {
    const counter = setInterval(() => {
      const remaining = localStorage.endTime - new Date();
      if (remaining >= 0) {
        setSessionMessageTimer(remaining / 1000);
      } else {
        clearInterval(counter);
      }
    }, 100);
  };

  useEffect(() => {
    timeTicker();
  }, []);

  return (
    <main className="c-main">
      <CContainer fluid>
        {sessionMessageTimer > 1 && location.pathname === "/articles" && (
          <CAlert
            className="text-center"
            style={{
              backgroundColor: "#3c4b64",
              borderColor: "#3c4b64",
              color: "#fff",
            }}
          >
            Your session will expire in 9 hours.
          </CAlert>
        )}
        <Suspense fallback={loading}>
          <Switch>
            {routes.map((route, idx) => {
              return (
                route.component && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    render={(props) => <route.component {...props} />}
                  />
                )
              );
            })}
            <Redirect exact from="/" to="/articles" />
          </Switch>
        </Suspense>
      </CContainer>
    </main>
  );
};

export default React.memo(TheContent);
