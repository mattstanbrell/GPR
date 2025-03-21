'use client'

import { useEffect, useState } from "react";
import { type Schema } from "../../../../amplify/data/resource";
import AuditLogEntry from "./AuditLogEntry";
import AuditLogsPagination from "./AuditLogsPagination";
import AuditLogsFilters from "./AuditLogsFilters";

type AuditLog = Schema["AuditLog"]["type"];

const AuditLogsClient = ({ logs }: { logs: AuditLog[] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(20);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAction, setSelectedAction] = useState("ALL");

  useEffect(() => {
    }, 
  [logsPerPage, selectedDate, selectedAction]);

  // Apply filter to logs
  const filteredLogs = logs.filter((log) => {
    const logDate = new Date(log.date).toISOString().split("T")[0];
    const isDateMatch = selectedDate
      ? logDate === selectedDate.toISOString().split("T")[0]
      : true; // If no date is selected, include all logs

    const isActionMatch = selectedAction === "ALL" || log.action.includes(selectedAction);

    return isDateMatch && isActionMatch;
  });

  // Sort filtered logs by chronological order with newest at the top
  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Paginate the sorted logs
  const totalPages = Math.ceil(sortedLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const currentLogs = sortedLogs.slice(startIndex, endIndex);

  // Get unique dates for the date selector
  const validLogDates = Array.from(
    new Set(
      logs.map((log) => {
        const date = new Date(log.date);
        return date.toISOString().split("T")[0];
      })
    )
  ).map((dateString) => new Date(dateString));

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const updateLogsPerPage = (newLogsPerPage: number) => {
    // Calculate the new page number to display the logs displayed before LogsPerPage update
    const newPage = Math.floor(1+ ( (currentPage - 1) * logsPerPage) / newLogsPerPage);

    setLogsPerPage(newLogsPerPage)
    const newTotalPages = Math.ceil(sortedLogs.length / newLogsPerPage)

    // In case of out of bounds, it sets new page to min or max
    if (newPage < 1){
      setCurrentPage(1);
    }
    else if (newPage > newTotalPages){
      setCurrentPage(newTotalPages);
    }
    else{
      setCurrentPage(newPage)
    }
  };

  const updateDate = (date: Date | null) => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

  const updateAction = (action: string) => {
    setSelectedAction(action);
    setCurrentPage(1);
  };

  return (
    <>
      <AuditLogsFilters
        logsPerPage={logsPerPage}
        updateLogsPerPage={updateLogsPerPage}

        selectedAction={selectedAction}
        updateAction={updateAction}

        validLogDates={validLogDates}
        selectedDate={selectedDate}
        updateDate={updateDate}
      />
      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-table__caption--xl">Audit Logs</caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">Event</th>
            <th scope="col" className="govuk-table__header">Date & Time</th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {currentLogs.length > 0 ? (
            currentLogs.map((log) => (
              <AuditLogEntry key={log.id} log={log} />
            ))
          ) : (
            <tr className="govuk-table__row">
              <td className="govuk-table__header" colSpan={2}>No audit log entries found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <AuditLogsPagination currentPage={currentPage} totalPages={totalPages} updatePage={handlePageChange} />
    </>
  );
};

export default AuditLogsClient;