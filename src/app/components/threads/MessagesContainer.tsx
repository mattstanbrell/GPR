'use client'

import Message from "./Message"
import { MessageType } from "./types"
import { useAuth } from "@/utils/authHelpers";

interface MessagesContainerProps {
    messages?: MessageType[]
}



const MessagesContainer = ({ messages }: MessagesContainerProps) => {
    const currentUser = useAuth();

    return (
        <div className="flex flex-col flex-1 gap-5 max-h-100 p-4 overflow-y-auto">
            {messages?.map((message, i) => {
                return (
                    <Message
                        message={message}
                        className={
                            `flex flex-col
                            text-white
                            ${currentUser?.id == message.id ? 
                                "bg-(--color-background-medium) self-end" : 
                                "bg-(--color-background-dark)"} 
                            ${i == messages.length - 1 ? "mb-4" : null}`}
                        key={message.id}
                    />
                )
            })}
        </div>
    )
}

export default MessagesContainer
