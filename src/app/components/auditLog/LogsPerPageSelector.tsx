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
    <div className="form__control items-center md:gap-3 mb-1 flex-1">
      <label className="govuk-label">Logs per page:</label>
      <select className="govuk-select" value={logsPerPage} onChange={handleLogsPerPageChange}>
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
    </div>
  );
};

export default LogsPerPageSelector;