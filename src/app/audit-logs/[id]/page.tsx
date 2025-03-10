// import { notFound } from "next/navigation";

'use client'

import { useState, useEffect } from "react";
import { getAuditLogById } from "@/utils/apis"

import { type Schema } from "../../../../amplify/data/resource";

type AuditLog = Schema["AuditLog"]["type"]; 

const AuditLogDetail = ({ params, }: { params: Promise<{ id: string }> }) => {
  const [auditLog, setAuditLog] = useState<AuditLog | null>();
  const [isLoading, setIsLoading] = useState(true); 
  const [auditLogId, setAuditLogId] = useState<string>("");
  const [isIDLoaded, setIsIDLoaded] = useState(false)

  useEffect(() => {
    const fetchLogId = async () => {
      const { id } = await params
      setAuditLogId(id)
      setIsIDLoaded(true)
    };
    fetchLogId();
  }, [])

  useEffect(() => {
    const fetchAuditLog = async () => {
      const data = await getAuditLogById(auditLogId)
      setAuditLog(data)
      setIsLoading(false)
    }
    fetchAuditLog();
  }, [isIDLoaded])

  return (
    <>
      {
        isLoading ? (
          <h3>loading</h3>
        ) : (
          <main className="govuk-main-wrapper">
            <h1 className="govuk-heading-xl">Event Details</h1>
            <p className="govuk-body"><strong>Audit Log ID:</strong> {auditLog?.id}</p>
          </main>
        )
      }
    </>
  )

}

export default AuditLogDetail; 
