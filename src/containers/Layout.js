import React, { useEffect } from 'react'
import { useDispatch } from "react-redux";
import { useLocation, matchPath } from 'react-router-dom'
import useWebSocket from "react-use-websocket";
import { isAuthenticated, signOut } from 'core/services/auth'
import NotifModal from 'components/NotifModal'
import NotifToast from 'components/NotifToast'
import ArticleForm from 'pages/Article/formLayout'
import * as masterActions from "store/master/actions";
import {
  TheContent,
  TheSidebar,
  TheFooter,
  TheHeader
} from './index'

const TheLayout = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated()) {
      signOut()
    }
  }, []) /* eslint-disable-line */

  const isArticleFormMatched = !!matchPath(
    location.pathname, 
    '/article/articleForm/:id'
  );

  const isCreateArticle = !!matchPath(
    location.pathname, 
    '/article/articleForm'
  );
  
  const socketUrl = process.env.REACT_APP_FUNCTION_URL_WEB_SOCKET

  const messageListener = (e) => {
    const { data } = e;
    const parsedData = JSON.parse(data)["message"];
    console.log("messageListenerEvent:", e);
    if (parsedData !== "Internal server error") {
      const { articleTitle, publishedBy } = parsedData;
      dispatch(
        masterActions.updateNotificationToast({
          open: true,
          headerText: articleTitle,
          bodyText: publishedBy,
        })
      );
      console.log("articleTitle", articleTitle);
      console.log("publishedBy", publishedBy);
    }
  };
  
  const { sendJsonMessage } = useWebSocket(socketUrl, {
    onOpen: (e) => console.log(e.type),
    //Will attempt to reconnect on all close events, such as server shutting down
    shouldReconnect: (closeEvent) => true,
    onClose: () => console.log("close"),
    onMessage: messageListener,
  });

  useEffect(() => {
    dispatch(masterActions.updateNotificationService(sendJsonMessage))
  }, []) /*eslint-disable-line*/

  return (
    <div className="c-app c-default-layout">
      <NotifModal />
      <NotifToast />
      {
        isArticleFormMatched || isCreateArticle ?
        <ArticleForm />
        :
        <React.Fragment>
          
          {
            location.pathname !== '/platform' &&
            location.pathname !== '/platformForm' && 
            location.pathname !== '/setupPlugin' && 
            location.pathname !== '/enableModule' && 
              <>
                <TheSidebar/>
              </>
          }
          <div className="c-wrapper">
            <TheHeader/>
            <div className="c-body">
              <TheContent/>
            </div>
            <TheFooter/>
          </div>
        </React.Fragment>
      }
    </div>
  )
}

export default TheLayout
