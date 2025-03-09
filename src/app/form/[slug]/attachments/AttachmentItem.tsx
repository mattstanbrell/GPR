import React, { useState } from "react";

interface AttachmentItemProps {
  file: File;
  onDelete: (fileName: string) => void;
}

export default function AttachmentItem({ file, onDelete }: AttachmentItemProps) {
  const [fileName, setFileName] = useState(file.name);

  const renameFile = () => {
    const newName = prompt("Enter new file name:", fileName);
    if (newName) setFileName(newName);
  };

  const downloadFile = () => {
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
    <li className="govuk-body">
      <span>{fileName}</span>
      <button className="govuk-button govuk-button--secondary" onClick={renameFile}>
        Rename
      </button>
      <button className="govuk-button govuk-button--warning" onClick={() => onDelete(file.name)}>
        Delete
      </button>
      <button className="govuk-button govuk-button--primary" onClick={downloadFile}>
        Download
      </button>
    </li>
  );
}
