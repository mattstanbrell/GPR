'use client'

import AuditLogsClient from "@/app/components/auditLog/AuditLogsClient";
import { listAuditLogs } from "@/utils/apis";
import { useState, useEffect } from "react";

import seedDummyData from "@/seeder";

import { type Schema } from "../../../amplify/data/resource";

type AuditLog = Schema["AuditLog"]["type"]; 

const AuditLogsPage = () => {

  // const [isComplete, setIsComplete] = useState(false); 
  // useEffect(() => {
  //   const fetchCreateUser = async () => {
  //     seedDummyData();
  //   setIsComplete(true);
  // }
  //   fetchCreateUser();
  // }, [])

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