'use client'

import { useState } from "react";
import { type Schema } from "../../../../amplify/data/resource";
import AuditLogEntry from "./AuditLogEntry";
import AuditLogsPagination from "./AuditLogsPagination";

type AuditLog = Schema["AuditLog"]["type"];

const AuditLogsClient = ({logs} : {logs:AuditLog[]}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(20);

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalPages = Math.ceil(sortedLogs.length / logsPerPage);

  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const currentLogs = sortedLogs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <table className="govuk-table">
        <caption className="govuk-table__caption govuk-table__caption--xl">Audit Logs</caption>
        <thead className="govuk-table__head">
          <tr className="govuk-table__row">
            <th scope="col" className="govuk-table__header">Event</th>
            <th scope="col" className="govuk-table__header">Date & Time</th>
          </tr>
        </thead>
        <tbody className="govuk-table__body">
          {sortedLogs.length > 0 ? (
            sortedLogs.map((log) => 
              <AuditLogEntry key={log.id} log={log} />
            )
          ) : (
            <tr className="govuk-table__row">
              <td className="govuk-table__header" colSpan={2}>No audit log entries found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <AuditLogsPagination currentPage={currentPage} totalPages={totalPages} updatePage={handlePageChange}/>
    </>
  );
}

export default AuditLogsClient;