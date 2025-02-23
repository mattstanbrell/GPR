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

  return (
    <main className="govuk-main-wrapper">
      <div className="govuk-width-container">
        <div className="govuk-grid-row">
            <AuditLogClient />
        </div>
      </div>
    </main>
  );
}
