"use client";
import * as React from 'react';
import AttachmentsList from "./AttachmentsList";

const Attachments = () => {
  const [files, setFiles] = React.useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const newFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const deleteFile = (fileName: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName));
  };

  return (
    <div className="govuk-width-container">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl" style={{marginBottom: '0'}}>(Form Name)</h1>
          <span className="govuk-caption-m">Attachments</span>
          <div style={{ width: "100%", height: ".25rem", backgroundColor: "#AA8CAE", marginTop: "25px", marginBottom: "15px" }}></div>

          <AttachmentsList files={files} onDelete={deleteFile} onUpload={handleFileUpload}/>

          <button className="govuk-button" data-module="govuk-button">
            Save
          </button>
          <button className="govuk-button govuk-button--warning" data-module="govuk-button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Attachments; 