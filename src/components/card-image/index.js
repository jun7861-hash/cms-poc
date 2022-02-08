import React from "react";
import { useSelector } from "react-redux";
import { CCol } from "@coreui/react";
import "./style.scss";

const CardImg = ({ src, alt, deleteImage, selectImage, className }) => {
  // permission to delete image in image library
  const userPermissions = useSelector((state) => state.master.userPermissions);
  const isAllowedToDelete = userPermissions.includes("ImageLibrary.Delete");

  return (
    <>
      <CCol
        className="image-col col-sm-5th mb-2 pl-0"
        onClick={() => selectImage()}
      >
        {isAllowedToDelete && (
          <i
            onClick={deleteImage}
            className="toggle material-icons d-block position-absolute font-weight-bold p-2"
          >
            close
          </i>
        )}
        <img className={className} src={src} alt={alt} />
      </CCol>
    </>
  );
};

export default CardImg;
