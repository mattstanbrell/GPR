export interface ThreadType {
    name: string
    threadId: string
    message: string
    unreadCount: number
}

type UserType = {id: string, firstName: string, lastName: string};


export type MessageType = {id: string, user: UserType, content: string, timeSent: string}; 
