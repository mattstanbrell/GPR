import AuditLogsClient from "./AuditLogsClient"
import { createAuditLog, listAuditLogs } from "@/utils/apis";
import * as React from 'react';

interface AuditLogEntry {
  id: string;
  action: string;
  date: string;
  userId: string;
  formId: string;
}

export async function initializeAuditLogs() {
  const dummyAuditLogs = [
    {
      action: "John Doe approved a form",
      date: new Date(2025, 1, 23, 14, 30).toISOString(),
      userID: "user_A001",
      formID: "form_B001",
    },
    {
      action: "Jane Doe submitted a form",
      date: new Date(2025, 1, 24, 10, 15).toISOString(),
      userID: "user_A002",
      formID: "form_B002",
    },
    {
      action: "Bob Smith reviewed a form",
      date: new Date(2025, 1, 25, 9, 45).toISOString(),
      userID: "user_A003",
      formID: "form_B003",
    },
  ];

  try {
    // Create each dummy audit log in the database
    for (const log of dummyAuditLogs) {
      await createAuditLog(log.action, log.date, log.userID, log.formID);
      console.log(`Audit log created: ${log.action}`);
    }
    console.log("All dummy audit logs initialized!");
  } catch (error) {
    console.error("Error initializing audit logs:", error);
  }
}

// export async function getAuditLogs(){
//   const auditLogs = (await listAuditLogs()) || [];
//   return auditLogs;
// }

export async function getAuditLogs(){
  return [
    {
      action: "John Doe approved a form",
      date: new Date(2025, 1, 23, 14, 30).toISOString(),
      userID: "user_A001",
      formID: "form_B001",
    },
    {
      action: "Jane Doe submitted a form",
      date: new Date(2025, 1, 24, 10, 15).toISOString(),
      userID: "user_A002",
      formID: "form_B002",
    },
    {
      action: "Bob Smith reviewed a form",
      date: new Date(2025, 1, 25, 9, 45).toISOString(),
      userID: "user_A003",
      formID: "form_B003",
    },
  ];
}

export default async function AuditLogsPage() {
  const rawAuditLogs = await getAuditLogs();

  const auditLogs: AuditLogEntry[] = rawAuditLogs.map(log => ({
    id: "1",
    // id: log.id,
    action: log.action,
    date: log.date, // ✅ Convert string → Date
    // userId: log.user?.id || "Unknown", //
    // formId: log.formId || "Unknown", //
    userId: "Unknown", // 
    formId: "Unknown", //
  }));

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
