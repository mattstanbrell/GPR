"use client"

import { useEffect, useState} from "react";
import { createAuditLog } from "./apis";
import { useUserModel } from "./authenticationUtils";

export const addAuditLog = (formID: string, action: string) => {
  useEffect (()=> {
    const generateAuditLog = async () => {
      const currentUser = useUserModel();
        // console.log(currentUser)
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