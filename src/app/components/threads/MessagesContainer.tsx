'use client'

import Message from "./Message"
import { MessageType } from "./types"
import { useUserModel } from "@/utils/authenticationUtils";
import { useLayoutEffect, useRef } from "react";


interface MessagesContainerProps {
    messages?: MessageType[] | null
    loading?: boolean
}

const MessagesContainer = ({ messages, loading }: MessagesContainerProps) => {
    const currentUser = useUserModel();
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    if (loading) {
        return (
            <div className="flex flex-col flex-1 gap-5 max-h-100 p-4 overflow-y-auto">
                <Message loading={loading} className="bg-(--color-background-medium) self-end"/>
                <Message loading={loading} className="bg-(--color-background-medium)" />
                <Message loading={loading} className="bg-(--color-background-medium) self-end"/>
            </div>
        )
    }

    return (
        <div ref={containerRef} className="flex flex-col flex-1 gap-5 max-h-100 p-4 overflow-y-auto">
            { !messages ? 
                <p className="text-center text-white font-bold pt-1">Nothing to see here!</p>
                :
                messages.map((message, i) => {
                    return (
                        <Message
                            message={message}
                            className={
                                `flex flex-col
                                text-white
                                ${currentUser?.id == message.id ? 
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
