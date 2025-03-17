
import type { Schema } from "../../../amplify/data/resource";

export type User = Schema["User"]["type"]; 
export type Form = Schema["Form"]["type"] | Partial<Schema["Form"]["type"]>;
export type FormAssignee = Schema["FormAssignee"]["type"];
export type Child = Schema["Child"]["type"];
export type Receipt = Schema["Receipt"]["type"]; 
export type AuditLog = Schema["AuditLog"]["type"];
export type UserChild = Schema["UserChild"]["type"];
export type Norm = Schema["Norm"]["type"]; 
export type NormConversation = Schema["NormConversation"]["type"]; 
export type FormStatus = Form["status"];
export type PermissionsGroup = User["permissionGroup"]; 
export type Message = Schema["Message"]["type"];
export type UserThread = Schema["UserThread"]["type"];
