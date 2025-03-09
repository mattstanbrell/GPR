"use client";
import React, { useState } from "react";

export default function FormAttachmentsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const newFiles = Array.from(event.target.files);
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const renameFile = (file: File, newName: string) => {
    setFileNames((prev) => ({ ...prev, [file.name]: newName }));
  };

  const deleteFile = (file: File) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    setFileNames((prev) => {
      const newNames = { ...prev };
      delete newNames[file.name];
      return newNames;
    });
  };

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="govuk-width-container">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">

          {files.length > 0 && (
            <div className="govuk-form-group">
              <h2 className="govuk-heading-m">Uploaded Files</h2>
              <ul className="govuk-list">
                {files.map((file) => (
                  <li key={file.name} className="govuk-body">
                    <span>{fileNames[file.name] || file.name}</span>
                    <button
                      className="govuk-button govuk-button--secondary"
                      onClick={() => {
                        const newName = prompt("Enter new file name:", file.name);
                        if (newName) renameFile(file, newName);
                      }}
                    >
                      Rename
                    </button>
                    <button
                      className="govuk-button govuk-button--warning"
                      onClick={() => deleteFile(file)}
                    >
                      Delete
                    </button>
                    <button
                      className="govuk-button govuk-button--primary"
                      onClick={() => downloadFile(file)}
                    >
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="file-upload-1">
              Upload Files
            </label>
            <input
              className="govuk-file-upload"
              id="file-upload-1"
              name="fileUpload"
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
