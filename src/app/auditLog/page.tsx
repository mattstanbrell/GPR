import { redirect } from "next/navigation";
import AuditLogClient from "./AuditLogClient"
import {
  AuthGetCurrentUserServer,
  cookiesClient,
} from "@/utils/amplifyServerUtils";

async function getAuditLogs() {
  // REPLACE with call to DB to fetch audit logs data
  return [
    { id: "A123", action: "John Doe approved a form", date: new Date(2025, 1, 23, 14, 30) },
    { id: "B456", action: "Jane Doe submitted a form", date: new Date(2025, 1, 24, 10, 15) },
  ];
}

export default async function AuditLogPage() {
  const user = await AuthGetCurrentUserServer();
  if (!user) {
    redirect("/");
  }
  const auditLogs = await getAuditLogs();

  return (
    <main className="govuk-main-wrapper">
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
            <AuditLogClient logs={auditLogs}/>
        </div>
      </div>
    </main>
  );
}
