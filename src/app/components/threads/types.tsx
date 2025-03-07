import { Schema } from "../../../../amplify/data/resource"

export interface ThreadType {
    name: string
    threadId: string
    message: string
    unreadCount: number
}


export type MessageType = Schema["Message"]["type"]