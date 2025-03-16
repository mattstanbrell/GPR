"use client"

// import { AppContext } from "@/app/layout";
import type { Form } from "@/app/types/models";
import { useEffect, useContext} from "react";
import { createAuditLog } from "./apis";
// import { AppContext } from "@/app/layout";

// export const addAuditLog = (formID: string, action: string) => {

//   const {currentUser} = useContext(AppContext);
//   console.log("currentUser:", currentUser)

//   useEffect (()=> {
//     const generateAuditLog = async () => {
//       try{
//         if (currentUser?.id) {
//           await createAuditLog(
//             action,
//             currentUser?.id,
//             formID
//           );
//         }
//       } catch (error) {
//         console.error("Failed to fetch user settings:", error);
//       }
//     }
//     generateAuditLog()
//   }, [])
// }

export const addAuditLog = (formID: string, action: string) => {

  useEffect (()=> {
    const generateAuditLog = async () => {
      try{
        if (1) {
          await createAuditLog(
            action,
            "currentUser?.id",
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