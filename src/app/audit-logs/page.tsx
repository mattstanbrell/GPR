'use client'

import AuditLogsClient from "@/app/components/auditLog/AuditLogsClient"
import { createAuditLog, listAuditLogs } from "@/utils/apis";
import { useState, useEffect } from "react";

import { type Schema } from "../../../amplify/data/resource";

type AuditLog = Schema["AuditLog"]["type"]; 

const AuditLogsPage = () => {
  
  const dummyAuditLogs = [
    {
      action: "John Doe approved a form",
      date: new Date().toISOString(),
      userID: "user_A001",
      formID: "form_B001",
    },
    {
      action: "Jane Doe submitted a form",
      date: new Date().toISOString(),
      userID: "user_A002",
      formID: "form_B002",
    },
    {
      action: "Bob Smith reviewed a form",
      date: new Date().toISOString(),
      userID: "user_A003",
      formID: "form_B003",
    },
  ];

  // const [isComplete, setIsComplete] = useState(false); 
  // useEffect(() => {
  //   const fetchCreateUser = async () => {
  //     await Promise.all(
  //     dummyAuditLogs.map(async ({action, date, userID, formID}) => {
  //       await createAuditLog(action, date, userID, formID)
  //     })
  //   );
  //   setIsComplete(true);
  // }
  //   fetchCreateUser();
  // }, [])

  const [auditLogs, setAuditLogs] = useState<AuditLog[] | null>(null)
  const [loadComplete, setLoadComplete] = useState(false);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const logs = await listAuditLogs();
        console.log(logs);
        setAuditLogs(logs);
      } catch (error) {
        console.log("Error when fetching audit logs:", error);
      } finally {
        setLoadComplete(true);
      }
    };
    fetchAuditLogs();
  }, [])

  console.log(auditLogs)

  return (
    <>
      {loadComplete ? (
        auditLogs ? (
          <AuditLogsClient logs={auditLogs}/>
        ) : (
          <h3>No logs have been created yet</h3>
        )
      ) : (
        <h3>Loading Logs...</h3>
      )}
    </>
  );
}

export default AuditLogsPage;