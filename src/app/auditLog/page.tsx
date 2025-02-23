import { redirect } from "next/navigation";
import AuditLogClient from "./AuditLogClient"
import {
  AuthGetCurrentUserServer,
  cookiesClient,
} from "@/utils/amplifyServerUtils";

export default async function AuditLogPage() {
  const user = await AuthGetCurrentUserServer();
  if (!user) {
    redirect("/");
  }

  // const todosResponse = await cookiesClient.models.Todo.list();
  const auditLogs = [
    { action: "John Doe approved a form", date: new Date(2025, 1, 23, 14, 30) },
    { action: "Jane Doe submitted a form", date: new Date(2025, 1, 22, 14, 30) },
  ];

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
