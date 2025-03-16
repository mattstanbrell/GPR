'use client'

import { useRouter } from "next/navigation";
import { type Schema } from "../../../../amplify/data/resource";
import { getUserById } from "@/utils/apis";
import { useState, useEffect } from "react";

type AuditLog = Schema["AuditLog"]["type"];
type User = Schema['User']['type'];

// Function to format date & time in custom format
function formatDate(date: string): string {
  const [datePart, timePart] = date.split("T");
  const [year, month, day] = datePart.split("-");
  const [hour, minute] = timePart.split(":");
  return `${day}/${month}/${year.substring(2, 4)} ${hour}:${minute}`;
}

const AuditLogEntry = ({ log }: {log : AuditLog} ) => {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  console.log(log)

  useEffect(() => {
    const getUser = async () => {
      try {
        if (log?.userID) {
          const user = await getUserById(log.userID);
          setUser(user);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoaded(true);
      }
    };
    getUser();
  }, [log.userID]);

  const viewLogDetails = () => {
    router.push(`/audit-logs/${log.id}`);
  };

  return (
    <>
      {loaded ? (
        <tr 
        className="govuk-table__row"
        onClick={viewLogDetails}
        style={{ cursor: "pointer" }}
      >
        <th scope="row" className="govuk-table__header"> {user?.firstName} {user?.lastName} {log.action}</th>
        <td className="govuk-table__cell">{formatDate(log.date)}</td>
      </tr>
      ) : (
        <tr><td>Loading log content...</td></tr>
      )}
    </>
  );
};

export default AuditLogEntry;

