import React, { useState } from "react";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css"; // main css file
import "react-date-range/dist/theme/default.css"; // theme css file
import {
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CButton,
} from "@coreui/react";
import "react-datepicker/dist/react-datepicker.css";
import "./index.scss"

const RangePicker = ({ onChange, ranges, onClick, value }) => {
  // hide/show date picker
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <div className="_date-range-picker position-relative">
        <CInputGroup onClick={() => setShowPicker(true)} className="mb-1">
          <CInputGroupPrepend>
            <CInputGroupText>
              <i className="material-icons" style={{ fontSize: "1.25rem" }}>
                today
              </i>
            </CInputGroupText>
          </CInputGroupPrepend>
          <CInput type="text" readOnly value={value || ""} />
        </CInputGroup>

        <div
          style={{
            right: "0",
            zIndex: "50",
            position: "absolute",
            backgroundColor: "#fff",
            borderRadius: ".5rem",
            border: "solid 1px #eee",
          }}
          className={`${showPicker ? "d-block " : "d-none"} calendar-container mb-2`}
        >
          <div className="d-flex">
            <DateRangePicker
              onChange={(e) => onChange(e)}
              showSelectionPreview={true}
              moveRangeOnFirstSelection={false}
              months={2}
              ranges={ranges}
              direction="horizontal"
            />
          </div>
          <div className="d-flex justify-content-end">
            <CButton
              onClick={(e) => {
                onClick(e);
                setShowPicker(false);
              }}
              size="sm"
              type="button"
              color="info"
              className="py-0 mx-1"
            >
              Apply
            </CButton>
            <CButton
              onClick={() => setShowPicker(false)}
              size="sm"
              type="button"
              color="secondary"
              className="py-0 mx-1"
            >
              Cancel
            </CButton>
          </div>
        </div>
      </div>
    </>
  );
};

export default RangePicker;
