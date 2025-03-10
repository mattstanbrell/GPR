import { Avatar, getInitials } from "../util/Avatar"
import { PrimaryButton } from "../util/Button"
import Toggle from "./Toggle"
import { FORM } from "@/app/constants/urls"
import MessagesContainer from "./MessagesContainer"
import { useAuth, getName } from "@/utils/authHelpers"
import Link from "next/link"


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
            content: "Hello",
            timeSent: "12:00"
        },
        {
            id: "2", 
            user: {
                id: "121314",
                firstName: "Bob",
                lastName: "Jones"
            },
            content: "Hi",
            timeSent: "12:01"
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
                                                className={`w-10 h-10 text-[0.6em] outline-3 order-first outline-(--color-background-light) ${zindex}`} 
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
                    <h1 className="self-center flex-1 text-center !mb-0">Select a thread to view</h1>
                }
                {isMobile ?
                    <Toggle
                        sidebarToggle={sidebarToggle}
                        className="absolute right-2 top-6 filter-(--hounslow-primary-filter)"
                    /> : null
                }
            </div>
            <MessagesContainer messages={thread.messages} />
            <div>
                Input
            </div>
        </div>
    )
}

export default Thread