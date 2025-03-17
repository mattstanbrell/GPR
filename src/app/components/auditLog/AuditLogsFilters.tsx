import LogsPerPageSelector from "./LogsPerPageSelector";
import FilterByActionSelector from "./FilterByActionSelector";
import FilterByDateSelector from "./FilterByDateSelector";

type AuditLogsFiltersProps = {
  logsPerPage: number;
  updateLogsPerPage: (logsPerPage: number) => void;
  selectedAction: string;
  updateAction: (action: string) => void;
  validLogDates: Date[];
  selectedDate: Date | null;
  updateDate: (date: Date | null) => void;
};

const AuditLogsFilters = ({
  logsPerPage,
  updateLogsPerPage,
  selectedAction,
  updateAction,
  validLogDates,
  selectedDate,
  updateDate,
}: AuditLogsFiltersProps) => {
  return (
    <div className="md:flex md:justify-evenly w-full my-2">
      <LogsPerPageSelector logsPerPage={logsPerPage} updateLogsPerPage={updateLogsPerPage} />
      <FilterByActionSelector action={selectedAction} updateAction={updateAction} />
      <FilterByDateSelector logDatesSet={validLogDates} selectedDate={selectedDate} updateDate={updateDate} />
    </div>
  );
};

export default AuditLogsFilters;