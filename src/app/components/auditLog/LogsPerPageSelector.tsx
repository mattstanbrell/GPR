type LogsPerPageSelectorProps = {
  logsPerPage: number;
  updateLogsPerPage: (logsPerPage: number) => void;
};

const LogsPerPageSelector = ({ logsPerPage, updateLogsPerPage }: LogsPerPageSelectorProps) => {

  const handleLogsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLogsPerPage = parseInt(event.target.value, 10);
    updateLogsPerPage(selectedLogsPerPage);
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} className="form__control">
      <label className="govuk-label">LogsPerPage</label>
      <select style={{ width: "min(700px, 60%)" }} className="govuk-select" value={logsPerPage} onChange={handleLogsPerPageChange}>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
    </div>
  );
};

export default LogsPerPageSelector;