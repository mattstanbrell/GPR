'use client'

import { useRouter } from "next/navigation";
import { type Schema } from "../../../../amplify/data/resource";
import AuditLogEntry from "./AuditLogEntry";

type AuditLog = Schema["AuditLog"]["type"];

// Function to display date&time in custom format
function formatDate(date: string): string {
  // ISO format is YYYY-MM-DD 'T' HH:MM:SS.SSS 'Z'
  const [datePart, timePart] = date.split("T");

  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");

  return `${day}/${month}/${year.substring(2, 4)} ${hour}:${minute}`;
}

const AuditLogsClient = ({logs} : {logs:AuditLog[]}) => {
  const router = useRouter();

  const viewLogDetails = (id: string) => {
    router.push(`/audit-logs/${id}`);
  };

  const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <table className="govuk-table">
      <caption className="govuk-table__caption govuk-table__caption--xl">Audit Logs</caption>
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th scope="col" className="govuk-table__header">Event</th>
          <th scope="col" className="govuk-table__header">Date&Time</th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {sortedLogs.length > 0 ? (
          sortedLogs.map((log) => <AuditLogEntry key={log.id} log={log} />)
        ) : (
          <tr className="govuk-table__row">
            <td className="govuk-table__header" colSpan={2}>No audit log entries found.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default AuditLogsClient;