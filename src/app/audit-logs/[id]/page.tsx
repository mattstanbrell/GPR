'use client'

import { useState, useEffect } from "react";
import { getAuditLogById, getUserById } from "@/utils/apis"
import { useRouter } from "next/navigation";
import { type Schema } from "../../../../amplify/data/resource";

type AuditLog = Schema["AuditLog"]["type"];
type User = Schema['User']['type'];

// Function to format date & time in custom format
function formatDate(date: string): string {
  const [datePart, timePart] = date.split("T");
  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");
  return `${day}/${month}/${year.substring(2, 4)} ${hour}:${minute}`;
}

const AuditLogDetail = ({ params }: { params: Promise<{ id: string }> }) => {
  const [auditLog, setAuditLog] = useState<AuditLog | null>();
  const [user, setUser] = useState<User | null>();
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params;
        const log = await getAuditLogById(id);
        setAuditLog(log);

        if (log?.userID) {
          const user = await getUserById(log.userID);
          setUser(user);
        }
      } catch (error) {
        console.error("Failed to fetch audit log or user:", error);
      } finally {
        setLoaded(true);
      }
    };
      fetchData();
  }, [params]);

  const handleViewForm = () => {
    router.push(`/form/${auditLog?.formID}`);
  };

  return (
    <>
      {loaded ? (
        <main className="govuk-main-wrapper">
          <h1 className="govuk-heading-xl">Event Details</h1>
          <p className="govuk-body"><strong>Audit Log ID:</strong> {auditLog?.id}</p>
          <p className="govuk-body">Date & Time of Audit: {formatDate(auditLog?.date ?? "")}</p>
          <p className="govuk-body">Audit action: {auditLog?.action}</p>
          <p className="govuk-body">Action performed by: {user?.firstName} {user?.lastName}</p>
          <p className="govuk-body">User id: {auditLog?.userID}</p>
          <p className="govuk-body">ID of Form affected: {auditLog?.formID}</p>
          <button className="govuk-button govuk-button--secondary" onClick={handleViewForm}>View form</button>
        </main>
      ) : (
        <h3>loading audit log</h3>
      )}
    </>
  )
}

export default AuditLogDetail;