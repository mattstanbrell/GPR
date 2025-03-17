'use client'

import { useState, useEffect } from "react";
import { getAuditLogById, getUserById } from "@/utils/apis"
import { useRouter } from "next/navigation";
import { type Schema } from "../../../../amplify/data/resource";
import { FORM } from "@/app/constants/urls"

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
    router.push(`${FORM}?id=${auditLog?.formID}`);
  };

  return (
    <>
      {loaded ? (
        <main className="govuk-main-wrapper">
          <table className="govuk-table">
            <caption className="govuk-table__caption govuk-table__caption--xl">Event Details</caption>
            <tbody className="govuk-table__body">
              <tr className="govuk-table__row">
                <th scope="row" className="govuk-table__header">Audit Log ID:</th>
                <th scope="row" className="govuk-table__header">{auditLog?.id}</th>
              </tr>
              <tr className="govuk-table__row">
                <td className="govuk-table__cell">Date & Time of Audit:</td>
                <td className="govuk-table__cell">{formatDate(auditLog?.date ?? "")}</td>
              </tr>
              <tr className="govuk-table__row">
                <td className="govuk-table__cell">Audit action:</td>
                <td className="govuk-table__cell">{auditLog?.action}</td>
              </tr>
              <tr className="govuk-table__row">
                <td className="govuk-table__cell">Action performed by:</td>
                <td className="govuk-table__cell">{user?.firstName} {user?.lastName}</td>
              </tr>
              <tr className="govuk-table__row">
                <td className="govuk-table__cell">User id:</td>
                <td className="govuk-table__cell">{auditLog?.userID}</td>
              </tr>
              <tr className="govuk-table__row">
                <td className="govuk-table__cell">User group:</td>
                <td className="govuk-table__cell">{user?.permissionGroup}</td>
              </tr>
              <tr className="govuk-table__row">
                <td className="govuk-table__cell">ID of Form affected:</td>
                <td className="govuk-table__cell">{auditLog?.formID}</td>
              </tr>
            </tbody>
          </table>

          <button className="govuk-button govuk-button--secondary" onClick={handleViewForm}>View form</button>
          
        </main>
      ) : (
        <h3>loading audit log</h3>
      )}
    </>
  )
}

export default AuditLogDetail;