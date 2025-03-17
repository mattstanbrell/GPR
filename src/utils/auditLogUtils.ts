"use client"

import { useEffect, useContext} from "react";
import { createAuditLog } from "./apis";
import { AppContext } from "@/app/layout";

export const addAuditLog = (formID: string, action: string) => {

  const {currentUser} = useContext(AppContext);

  useEffect (()=> {
    const generateAuditLog = async () => {
      try{
        if (currentUser?.id) {
          await createAuditLog(
            action,
            currentUser?.id,
            formID
          );
        }
      } catch (error) {
        console.error("Failed to fetch user settings:", error);
      }
    }
    generateAuditLog()
  }, [])
}