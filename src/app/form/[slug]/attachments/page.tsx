export default async function FormAttachmentsPage() {
  return (
    <div className="govuk-width-container">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-form-group">
            <label className="govuk-label" htmlFor="file-upload-1">
              Upload a file
            </label>
            <div
              className="govuk-drop-zone"
              data-module="govuk-file-upload">
              <input className="govuk-file-upload" id="file-upload-1" name="fileUpload1" type="file"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}