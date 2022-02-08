import React from "react";
import { CToast, CToastBody } from "@coreui/react";
import { useSelector, useDispatch } from "react-redux";
import * as masterActions from "../../store/master/actions";

const NotifToast = () => {
  const dispatch = useDispatch();
  const NotificationToast = useSelector(
    (state) => state.master.NotificationToast
  );

  // close/hide toast
  const handleClose = () => {
    dispatch(
      masterActions.updateNotificationToast({
        ...NotificationToast,
        open: false,
      })
    );
  };

  // autohide toast within 5 seconds
  const onStateChange = () => {
    setTimeout(() => {
      handleClose();
    }, 5000);
  };

  return (
    <>
      {NotificationToast.open && (
        <CToast
          className="position-fixed"
          style={{
            right: "2%",
            bottom: "2%",
            zIndex: "2000",
          }}
          show={true}
          fade={false}
          onStateChange={() => onStateChange()}
          color="dark"
        >
          <CToastBody className="position-relative">
            <div className='d-flex justify-content-between mb-2'>
              <p className="font-weight-bold text-break pr-2 mb-0">{NotificationToast.headerText}</p>
              <p
                onClick={() => handleClose()}
                className="material-icons font-weight-bold mb-0 pt-1"
                style={{
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                clear
              </p>
            </div>
            <p className="text-break">Published by {NotificationToast.bodyText}</p>
          </CToastBody>
        </CToast>
      )}
    </>
  );
};

export default NotifToast;
