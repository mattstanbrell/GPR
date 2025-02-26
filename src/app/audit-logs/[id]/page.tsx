// import { notFound } from "next/navigation";

async function getAuditLogDetails(auditLogId: string) {
  // REPLACE with call to DB to fetch the single audit log by id
  console.log(auditLogId)
  return [
    { allocationId: "8765C", workerId: "W1111", caseId: "C123", activity: "submit form" },
  ];
}

type AuditLogDetailProps = {
  id: string;
};

export default async function AuditLogDetail({ params }: { params: AuditLogDetailProps }) {
  params = await params;
  console.log(params)
  /**  Without this there is a warning `params` should be awaited before using its properties.
  Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis */

  const auditLogId = params.id;  // Extract the ID from params

  console.log(auditLogId)

  // Fetch the audit log details based on the ID.
  const auditLog = await getAuditLogDetails(auditLogId);

  // if (!auditLog || auditLog.length === 0) {
  //   return notFound(); // If no data found, show a 404 page
  // }

  return (
    <main className="govuk-main-wrapper">
      <h1 className="govuk-heading-xl">Event Details</h1>
      <p className="govuk-body"><strong>Audit Log ID:</strong> {auditLogId}</p>
      <p className="govuk-body"><strong>Allocation ID:</strong> {auditLog[0].allocationId}</p>
      <p className="govuk-body"><strong>Worker ID:</strong> {auditLog[0].workerId}</p>
      <p className="govuk-body"><strong>Case ID:</strong> {auditLog[0].caseId}</p>
      <p className="govuk-body"><strong>Activity:</strong> {auditLog[0].activity}</p>
    </main>
  );
}