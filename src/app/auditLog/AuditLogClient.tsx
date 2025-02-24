'use client'
import { useRouter } from "next/navigation";

interface AuditLogEntry {
  id: string;
  action: string;
  date: Date;
}
interface AuditLogClientProps {
  logs: AuditLogEntry[];
}

// Function to display date&time in custom format
function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24-hour time
  };
  
  return new Intl.DateTimeFormat("en-GB", options)
    .format(date)
    .replace(",", "");
}

export default function AuditLogClient({ logs }: AuditLogClientProps) {
  const router = useRouter();

  const viewLogDetails = (id: string) => {
    router.push(`/auditLog/${id}`);
  };

  return (
    <table className="govuk-table">
      <caption className="govuk-table__caption govuk-table__caption--xl">Audit Log</caption>
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th scope="col" className="govuk-table__header">Event</th>
          <th scope="col" className="govuk-table__header">Date&Time</th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {logs.length > 0 ? (
          logs.map((log) => (
            <tr 
            key={log.id} 
            className="govuk-table__row"
            onClick={() => viewLogDetails(log.id)} // Navigate to a new page
            style={{ cursor: "pointer" }} // Make it clear it's clickable
            >
              <th scope="row" className="govuk-table__header">{log.action}</th>
              <td className="govuk-table__cell">{formatDate(log.date)}</td>
            </tr>
          ))
        ) : (
          <tr className="govuk-table__row">
            <td className="govuk-table__header" colSpan={2}>No audit log entries found.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}