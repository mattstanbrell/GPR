'use client'

import { useRouter } from "next/navigation";
import { type Schema } from "../../../../amplify/data/resource";

type AuditLog = Schema["AuditLog"]["type"]; 

const AuditLogsClient = ({logs} : {logs:AuditLog[]}) => {
  const router = useRouter();

  const viewLogDetails = (id: string) => {
    router.push(`/audit-logs/${id}`);
  };

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
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <tr 
            key={ index } 
            className="govuk-table__row"
            onClick={() => viewLogDetails(log.id)} // Navigate to a new page
            style={{ cursor: "pointer" }} // Make it clear it's clickable
            >
              <th scope="row" className="govuk-table__header">{log.action}</th>
              {/* <td className="govuk-table__cell">{formatDate(log.date)}</td> */}
              <td className="govuk-table__cell">{log.date}</td>
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

export default AuditLogsClient;