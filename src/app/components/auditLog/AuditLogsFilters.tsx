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
    <div className="mb-4" style={{ backgroundColor: "var(--color-background-light)" }}>
      <div className="px-4 pt-2 text-lg govuk-heading-m" >
        Audit logs filters

        <div className="govuk-body-l md:flex flex-wrap md:justify-evenly w-full pt-4 pb-5">
          <LogsPerPageSelector logsPerPage={logsPerPage} updateLogsPerPage={updateLogsPerPage} />
          <FilterByActionSelector action={selectedAction} updateAction={updateAction} />
          <FilterByDateSelector logDatesSet={validLogDates} selectedDate={selectedDate} updateDate={updateDate} />

        </div>
      </div>
    </div>
  );
};

export default AuditLogsFilters;