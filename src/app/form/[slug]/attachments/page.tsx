"use client";
import React, { useState } from "react";
import AttachmentsList from "./AttachmentsList";

export default function FormAttachmentsPage() {
  const [files, setFiles] = useState<File[]>([]);

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
          
          <AttachmentsList files={files} onDelete={deleteFile} />

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="file-upload">
              Upload Files
            </label>
            <input
              className="govuk-file-upload"
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
