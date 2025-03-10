import { Avatar, getInitials } from "../util/Avatar"
import { PrimaryButton } from "../util/Button"
import Toggle from "./Toggle"
import { FORM } from "@/app/constants/urls"
import MessagesContainer from "./MessagesContainer"
import { useAuth, getName } from "@/utils/authHelpers"
import Link from "next/link"
import MessageInput from "./MessageInput"


const thread = {
    name: "Bob",
    threadId: "1",
    users: [{id: "121313", firstName: "Alice", lastName: "Smith"}, {id: "121314", firstName: "Bob", lastName: "Jones"}],
    formId: "1",
    messages: [
        {
            id: "1", 
            user: {
                id: "121313",
                firstName: "Alice",
                lastName: "Smith"
            },
            content: "Hello, how have you been? It's been a while since we last spoke.",
            timeSent: "2025-02-01T12:00:00Z"
        },
        {
            id: "2", 
            user: {
                id: "121314",
                firstName: "Bob",
                lastName: "Jones"
            },
            content: "Hi Alice! I've been good, thanks for asking. How about you?",
            timeSent: "2025-03-10T12:01:00Z"
        },
        {
            id: "3", 
            user: {
                id: "121313",
                firstName: "Alice",
                lastName: "Smith"
            },
            content: "I'm doing well too, just been busy with work and other things. What have you been up to?",
            timeSent: "2025-03-10T12:02:00Z"
        },
        {
            id: "4", 
            user: {
                id: "121314",
                firstName: "Bob",
                lastName: "Jones"
            },
            content: "I've been working on some new projects at work. It's been quite exciting!",
            timeSent: "2025-03-10T12:03:00Z"
        }
    ]
}


interface ThreadProps {
    sidebarToggle: () => void
    threadId?: string
    className?: string
    isMobile?: boolean
}

const Thread = ({ threadId, className, isMobile, sidebarToggle }: ThreadProps) => {
    const currentUser = useAuth();

    return (
        <div className={`flex flex-col bg-(--color-background-darkest) ${className}`}>

            <div className="relative bg-(--color-background-light) flex justify-center flex-col min-h-28 ">
                {threadId ?
                    <div className="py-2">
                        {isMobile ? <p className="app-alt-text ps-7 text-(--hounslow-primary)">Messages</p> : null}
                        <p className="text-3xl font-bold text-(--hounslow-primary) ps-7">{thread.name}</p>
                        <div className="flex pt-1 ps-6">
                            <div className="flex flex-1 -space-x-2">
                                {
                                    thread.users.map((user, i) => {
                                        const zindex = `z-${thread.users.length - i}`;
                                        const colour = currentUser?.id === user.id ? "bg-(--color-background-medium)" : "bg-(--color-background-dark)";
                                        return (
                                            <Avatar 
                                                text={getInitials(user.firstName + user.lastName)} 
                                                style={{ zIndex: thread.users.length - i }} 
                                                colour={colour} 
                                                className={`w-10 h-10 text-[0.6em] 
                                                    outline-3 order-first outline-(--color-background-light) cursor-pointer 
                                                    transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:opacity-90 ${zindex}`} 
                                                key={user.id}
                                                tooltipText={getName(user)}
                                            />
                                        )
                                    })
                                }
                            </div>
                            <Link href={`${FORM}/${thread.formId}`}>
                                <PrimaryButton className="me-4 h-10 text-xl">View Form</PrimaryButton>
                            </Link>
                        </div>
                    </div>
                    :
                    <p className="self-center text-center text-3xl font-bold text-(--hounslow-primary)">Select a thread to view</p>
                }
                {isMobile ?
                    <Toggle
                        sidebarToggle={sidebarToggle}
                        className="absolute right-2 top-6 filter-(--hounslow-primary-filter)"
                    /> : null
                }
            </div>
            <MessagesContainer messages={thread.messages} />
            <MessageInput className={isMobile ? "!mb-0" : "!mx-4 !mb-4 !mt-2"}/>
        </div>
    )
}

export default Thread