import * as React from 'react';

interface AttachmentItemProps {
  file: File;
  onDelete: (fileName: string) => void;
}

const AttachmentItem = ({ file, onDelete }: AttachmentItemProps) => {
  const [fileName, setFileName] = React.useState(file.name);

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
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">{fileName}</dt>
      <dd className="govuk-summary-list__actions">
      <button className="govuk-button govuk-button--primary" onClick={downloadFile}>
        Download
      </button>
      <button className="govuk-button govuk-button--secondary" onClick={renameFile}>
        Rename
      </button>
      <button className="govuk-button govuk-button--warning" onClick={() => onDelete(file.name)}>
        Delete
      </button>
      </dd>
    </div>
  );
}

export default AttachmentItem;
