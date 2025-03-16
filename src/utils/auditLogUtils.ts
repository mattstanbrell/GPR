"use client"

// import { AppContext } from "@/app/layout";
import type { User, Form } from "@/app/types/models";
import { useEffect, useContext} from "react";
import { createAuditLog } from "./apis";

// const {currentUser} = useContext<User>(AppContext);

const addAuditLog = (form: Form, action: string) => {

  useEffect (()=> {
    const addAuditLog = async () => {
      await createAuditLog(
        action,
        currentUser.userID,
        form?.id
      );
    }
    addAuditLog()
  }, [])
}