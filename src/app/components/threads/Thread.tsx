import { Avatar, getInitials } from "../util/Avatar"
import { PrimaryButton } from "../util/Button"
import Toggle from "./Toggle"
import { FORM } from "@/app/constants/urls"
import MessagesContainer from "./MessagesContainer"
import { useAuth, getName } from "@/utils/authHelpers"
import Link from "next/link"
import MessageInput from "./MessageInput"
import { FormType, MessageType, ThreadType, UserType } from "./types"
import { useEffect, useState } from "react"
import { createMessage, getUsersInThread, setThreadMessagesToRead } from "@/utils/apis"


interface ThreadProps {
    sidebarToggle: () => void
    thread?: ThreadType | null
    className?: string
    isMobile?: boolean
}

const Thread = ({ thread, className, isMobile, sidebarToggle }: ThreadProps) => {
    const currentUser = useAuth();
    const [allUsers, setAllUsers] = useState<UserType[] | null>(null);
    const [form, setForm] = useState<FormType | null>(null);
    const [messages, setMessages] = useState<MessageType[] | null>(null);

    useEffect(() => {
        // Fetches the users, form and messages for the thread
        // Also marks the messages as read for the current user
        async function fetchThreadData(){
            if(!thread) return;
            
            try{
                const [users, form, messages] = await Promise.all([
                    getUsersInThread(thread.id),
                    thread.form(),
                    thread.messages()
                ]);

                setAllUsers(users);
                setForm(form.data);
                setMessages(messages.data);

                if(!currentUser) return;
                await setThreadMessagesToRead(thread.id, currentUser.id);
            } catch (error) {
                console.error(error);
            }
        }
        fetchThreadData();
    },[thread, currentUser]);

    function onMessageSend(e: React.FormEvent<HTMLTextAreaElement>) {
        if(!currentUser?.id || !thread?.id || !e.currentTarget.value ) return;
        
        createMessage(currentUser?.id, thread?.id, e.currentTarget.value, new Date().toISOString());
    }


    return (
        <div className={`flex flex-col bg-(--color-background-darkest) max-h-140 min-h-120 ${className}`}>
            <div className="relative bg-(--color-background-light) flex justify-center flex-col min-h-28 ">
                { !thread ?
                    <p className="self-center text-center text-3xl font-bold text-(--hounslow-primary)">Select a thread to view</p>
                    :
                    <div className="py-2">
                        { isMobile &&
                            <p className="app-alt-text ps-7 text-(--hounslow-primary)">Messages</p>
                        }
                        <p className="text-3xl font-bold text-(--hounslow-primary) ps-7">{"PLACEHOLDER"}</p>
                        <div className="flex pt-1 ps-6">
                            <div className="flex flex-1 -space-x-2">
                                { !allUsers ?
                                    <p className="self-center text-center text-3xl font-bold text-(--hounslow-primary)">Loading...</p>
                                    :
                                    allUsers.map((user, i) => {
                                        const zindex = `z-${allUsers.length - i}`;
                                        const colour = currentUser?.id === user.id ? "bg-(--color-background-medium)" : "bg-(--color-background-dark)";
                                        return (
                                            <Avatar 
                                                text={getInitials(user.firstName + user.lastName)} 
                                                style={{ zIndex: allUsers.length - i }} 
                                                colour={colour} 
                                                className={`w-10 h-10 text-[0.6em] 
                                                    outline-3 order-first outline-(--color-background-light) cursor-pointer 
                                                    transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:opacity-90 
                                                    ${zindex}`} 
                                                key={user.id}
                                                tooltipText={getName(user)}
                                            />
                                        )
                                    })
                                }
                            </div>
                            { form && 
                                <Link href={`${FORM}/${form.id}`}>
                                    <PrimaryButton className="me-4 h-10 text-xl">View Form</PrimaryButton>
                                </Link>
                            }
                        </div>
                    </div>
                }
                { isMobile &&
                    <Toggle
                        sidebarToggle={sidebarToggle}
                        className="absolute right-2 top-6 
                            filter-(--hounslow-primary-filter)
                            transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:opacity-90"
                    />
                }
            </div>
            <MessagesContainer messages={messages} />
            {thread && 
                <MessageInput className={isMobile ? "!mb-0" : "!mx-4 !mb-4 !mt-0"} onSubmit={onMessageSend}/>
            }
        </div>
    )
}

export default Thread