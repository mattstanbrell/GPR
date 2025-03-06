import { redirect } from "next/navigation"
import { Avatar, getInitials } from "../util/Avatar"
import { PrimaryButton } from "../util/Button"
import Toggle from "./Toggle"
import { FORM } from "@/app/constants/urls"


const thread = {
    name: "Bob",
    threadId: "1",
    users: ["Alice", "Bob Dean", "Greg Dylan Cooper"],
    formId: "1",
    messages: [
        {
            sender: "Bob",
            message: "I'm unsure why that didn't work",
            timestamp: "2021-09-01T12:00:00Z"
        },
        {
            sender: "Alice",
            message: "I think you need to add more detail to the requirements",
            timestamp: "2021-09-01T12:01:00Z"
        }
    ]
}

const currentUser = {
    name: "Alice",
    userId: "1",
    threads: ["1", "2", "3"]
}

interface ThreadProps {
    sidebarToggle: () => void
    threadId?: string
    className?: string
    isMobile?: boolean
}

const Thread = ({ threadId, className, isMobile, sidebarToggle }: ThreadProps) => {
    return (
        <div className={`flex flex-col ${className}`}>

            <div className="relative bg-(--color-background-light)  pt-3 ">
                {threadId && isMobile ? <p className="app-alt-text ps-7 text-(--hounslow-primary)">Messages</p> : null}
                {threadId ?
                    <>
                        <p className="text-3xl font-bold text-(--hounslow-primary) ps-7">{thread.name}</p>
                        <div className="flex pt-2 px-6">
                            <div className="flex flex-1 -space-x-2  pb-4 ">
                                {
                                    thread.users.map((user, i) => {
                                        const zindex = `z-${thread.users.length - i}`;
                                        const colour = currentUser.name === user ? "bg-(--color-background-medium)" : "bg-(--color-background-dark)";
                                        return <Avatar text={getInitials(user)} style={{ zIndex: thread.users.length - i }} colour={colour} className={`w-10 h-10 text-[0.6em] outline-3 order-first outline-(--color-background-light) ${zindex}`} key={user} />
                                    })
                                }
                            </div>
                            <PrimaryButton className="px-1 h-10 text-xl" onClick={() => redirect(`${FORM}`)}>View Form</PrimaryButton>
                        </div>
                    </>
                    :
                    <h1>No thread selected</h1>
                }
                {isMobile ?
                    <Toggle
                        sidebarToggle={sidebarToggle}
                        className="absolute right-2 top-6 filter-(--hounslow-primary-filter)"
                    /> : null
                }
            </div>
            <div>
                Messages
            </div>
            <div>
                Input
            </div>
        </div>
    )
}

export default Thread