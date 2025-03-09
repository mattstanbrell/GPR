import React from "react";
import AttachmentItem from "./AttachmentItem";

interface AttachmentsListProps {
  files: File[];
  onDelete: (fileName: string) => void;
}

export default function AttachmentsList({ files, onDelete }: AttachmentsListProps) {
  return (
    <div className="govuk-form-group">
      {files.length > 0 && (
        <>
          <h2 className="govuk-heading-m">Uploaded Files</h2>
          <ul className="govuk-list">
            {files.map((file) => (
              <AttachmentItem key={file.name} file={file} onDelete={onDelete} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
