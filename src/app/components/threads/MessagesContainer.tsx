'use client'

import Message from "./Message"
import { MessageType } from "../../types/threads"
import { AppContext } from "@/app/layout";
import { useEffect, useRef, useContext } from "react";


interface MessagesContainerProps {
    messages?: MessageType[] | null
    loading?: boolean
}

const MessagesContainer = ({ messages, loading }: MessagesContainerProps) => {
    const { currentUser } = useContext(AppContext);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div ref={containerRef} className="flex flex-col flex-1 gap-5 h-100 p-4 overflow-y-auto">
            {loading ?
                <div className="flex flex-col flex-1 gap-5 max-h-100 p-4">
                    <Message loading={loading} className="bg-(--color-background-medium) self-end"/>
                    <Message loading={loading} className="bg-(--color-background-medium)" />
                    <Message loading={loading} className="bg-(--color-background-medium) self-end"/>
                </div>
                :
                !messages ? 
                    <p className="text-center text-white font-bold pt-1">Nothing to see here!</p>
                    :
                    messages.map((message, i) => {
                        return (
                            <Message
                                message={message}
                                className={
                                    `flex flex-col
                                    text-white
                                    ${currentUser?.id == message.userID ? 
                                        "bg-(--color-background-medium) self-end" 
                                        : 
                                        "bg-(--color-background-dark)"} 
                                    ${i == messages.length - 1 ? "mb-2" : null}`}
                                key={message.id}
                            />
                        )
                    })
            }
        </div>
    )
}

export default MessagesContainer
