import React from "react";
import {
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import { useSelector, useDispatch } from "react-redux";
import * as masterActions from "../../store/master/actions";
import "./style.scss";

const NotifModal = () => {
  const dispatch = useDispatch();
  const NotificationModal = useSelector(
    (state) => state.master.NotificationModal
  );

  // close modal handler
  const handleClose = () => {
    dispatch(
      masterActions.updateNotificationModal({
        ...NotificationModal,
        open: !NotificationModal.open,
      })
    );
  };

  // modal callback
  const callBack = () => {
    NotificationModal.callback(handleClose);
  };

  return (
    <CModal
      show={NotificationModal.open}
      onClose={() =>
        dispatch(
          masterActions.updateNotificationModal({
            open: !NotificationModal.open,
          })
        )
      }
      closeOnBackdrop={false}
      className="_notif-modal"
    >
      <CModalHeader className="border-bottom-0">
        <p className="mb-0" style={{ fontSize: "1.375rem", fontWeight: "300" }}>
          {NotificationModal.type === "error" ? (
            <span
              className="mr-2 material-icons md v-align-bottom"
              style={{ color: "rgb(229, 78, 102)" }}
            >
              error_outline
            </span>
          ) : (
            <span
              className="mr-2 material-icons md v-align-bottom"
              style={{ color: "rgb(40, 199, 177)" }}
            >
              check
            </span>
          )}
          {NotificationModal.headerText
            ? NotificationModal.headerText
            : NotificationModal.type === "error"
            ? "Error"
            : "Success"}
        </p>
      </CModalHeader>
      <CModalBody>{NotificationModal.bodyText}</CModalBody>
      <CModalFooter className="border-top-0">
        <CButton
          className="border"
          onClick={() =>
            NotificationModal.callback ? callBack() : handleClose()
          }
        >
          {NotificationModal.closeText ? NotificationModal.closeText : "CLOSE"}
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default NotifModal;
