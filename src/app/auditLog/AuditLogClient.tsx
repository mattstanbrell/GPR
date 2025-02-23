interface AuditLogEntry {
  action: string;
  date: Date;
}

interface AuditLogClientProps {
  logs: AuditLogEntry[];
}

export default function AuditLogClient({ logs }: AuditLogClientProps) {
  return (
    <table className="govuk-table">
      <caption className="govuk-table__caption govuk-table__caption--xl">Audit Log</caption>
      <thead className="govuk-table__head">
        <tr className="govuk-table__row">
          <th scope="col" className="govuk-table__header">Event</th>
          <th scope="col" className="govuk-table__header">Date</th>
        </tr>
      </thead>
      <tbody className="govuk-table__body">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <tr key={index} className="govuk-table__row">
              <th scope="row" className="govuk-table__header">{log.action}</th>
              <td className="govuk-table__cell">{log.date.toLocaleString()}</td>
            </tr>
          ))
        ) : (
          <tr className="govuk-table__row">
            <td className="govuk-table__cell" colSpan={2}>No audit log entries found.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}