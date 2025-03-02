import { redirect } from "next/navigation";
import AuditLogsClient from "./AuditLogsClient"
import {
  AuthGetCurrentUserServer,
} from "@/utils/amplifyServerUtils";

async function getAuditLogs() {
  // REPLACE with call to DB to fetch audit logs data
  return [
    { id: "A123", action: "John Doe approved a form", date: new Date(2025, 1, 23, 14, 30) },
    { id: "B456", action: "Jane Doe submitted a form", date: new Date(2025, 1, 24, 10, 15) },
  ];
}

export default async function AuditLogsPage() {
  const user = await AuthGetCurrentUserServer();
  if (!user) {
    redirect("/");
  }
  const auditLogs = await getAuditLogs();

  return (
    <div className="govuk-width-container">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <AuditLogsClient logs={auditLogs}/>
        </div>
      </div>
    </div>
  );
}
