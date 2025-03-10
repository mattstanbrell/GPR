import AttachmentItem from "./AttachmentItem";

interface AttachmentsListProps {
  files: File[];
  onDelete: (fileName: string) => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AttachmentsList({ files, onDelete, onUpload }: AttachmentsListProps) {
  return (
    <div className="govuk-form-group">
      <dl className="govuk-summary-list govuk-summary-list--long-key">

        {files.map((file) => (
          <AttachmentItem key={file.name} file={file} onDelete={onDelete} />
        ))}

      </dl>

      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="file-upload">
        Upload receipts (last receipt uploaded shown below)
        </label>
        <div className="govuk-drop-zone" data-module="govuk-file-upload">
          <input className="govuk-file-upload" id="file-upload" type="file" multiple onChange={onUpload}/>
        </div>
      </div>
      
    </div>
  );
}
