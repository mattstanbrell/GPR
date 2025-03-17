'use client'

import AuditLogsClient from "@/app/components/auditLog/AuditLogsClient";
import { listAuditLogs } from "@/utils/apis";
import { useState, useEffect } from "react";

import { type Schema } from "../../../amplify/data/resource";

type AuditLog = Schema["AuditLog"]["type"]; 

const AuditLogsPage = () => {

  const [auditLogs, setAuditLogs] = useState<AuditLog[] | null>(null)
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const logs = await listAuditLogs();
        setAuditLogs(logs);
      } catch (error) {
        console.log("Error when fetching audit logs:", error);
      } finally {
        setLoaded(true);
      }
    };
    fetchAuditLogs();
  }, [])

  // import { useGenerateAuditLog } from "@/utils/auditLogUtils";
  // useGenerateAuditLog("A123","denied a form")
  // useGenerateAuditLog("B123","submitted a form")
  // useGenerateAuditLog("C123","approved a form")

  return (
    <>
      {loaded ? (
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