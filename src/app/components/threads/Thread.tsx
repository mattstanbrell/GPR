import { Avatar, getInitials } from "../util/Avatar"
import { PrimaryButton } from "../util/Button"
import Toggle from "./Toggle"
import { FORM } from "@/app/constants/urls"
import MessagesContainer from "./MessagesContainer"
import Link from "next/link"
import MessageInput from "./MessageInput"
import { ThreadType } from "../../types/threads"
import { createMessage} from "@/utils/apis"
import { useContext } from "react"
import { getName } from "@/utils/authenticationUtils";
import { AppContext } from "@/app/layout"


interface ThreadProps {
    sidebarToggle: () => void
    thread?: ThreadType | null
    className?: string
    loading?: boolean
    isMobile?: boolean
}

const Thread = ({ thread, className, isMobile, sidebarToggle, loading }: ThreadProps) => {
    const { currentUser } = useContext(AppContext);

    function onMessageSend(message: string) {
        if(!currentUser?.id || !thread?.id || !message ) return;

        createMessage(currentUser?.id, thread?.id, message, new Date().toISOString());
    }

    return (
        <div className={`flex flex-col bg-(--color-background-darkest) max-h-140 min-h-120 ${className}`}>
            <div className={`relative bg-(--color-background-light) flex justify-center flex-col min-h-28 ${loading && "animate-pulse"}`}>
                { !loading &&
                    (!thread ?
                        <p className="self-center text-center text-3xl font-bold text-(--hounslow-primary)">Select a thread to view</p>
                        :
                        <div className="py-2">
                            { isMobile &&
                                <p className="app-alt-text ps-7 text-(--hounslow-primary)">Messages</p>
                            }
                            <p className="text-3xl font-bold text-(--hounslow-primary) ps-7">{thread.name}</p>
                            <div className="flex pt-1 ps-6">
                                <div className="flex flex-1">
                                    { !thread.allUsers ?
                                        <p className="self-center text-center text-3xl font-bold text-(--hounslow-primary)">Loading...</p>
                                        :
                                        thread.allUsers.map((user, i) => {
                                            const length = thread.allUsers?.length || 0;
                                            const zindex = currentUser?.id === user.id ? 100 : length - i;
                                            const colour = currentUser?.id === user.id ? "bg-(--color-background-medium)" : "bg-(--color-background-dark)";
                                            const order = currentUser?.id === user.id ? "order-1" : "order-2";
                                            return (
                                                <Avatar 
                                                    text={getInitials(getName(user))} 
                                                    style={{ zIndex: zindex, order: order }} 
                                                    colour={colour} 
                                                    className={`w-10 h-10 text-[0.6em] 
                                                        outline-3 ${order} outline-(--color-background-light) cursor-pointer 
                                                        transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:opacity-90 
                                                        `} 
                                                    key={user.id}
                                                    tooltipText={getName(user)}
                                                    tooltipStyles={order}
                                                />
                                            )
                                        })
                                    }
                                </div>
                                { thread.formId && 
                                    <Link href={`${FORM}?id=${thread.formId}`}>
                                        <PrimaryButton className="me-4 h-10 text-xl">View Form</PrimaryButton>
                                    </Link>
                                }
                            </div>
                        </div>
                    )}
                    { isMobile &&
                        <Toggle
                            sidebarToggle={sidebarToggle}
                            className="absolute right-2 top-6 
                                filter-(--hounslow-primary-filter)
                                transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 hover:opacity-90"
                        />
                    }
            </div>
            <MessagesContainer messages={thread?.allMessages} loading={loading} />
            {thread && 
                <MessageInput className={isMobile ? "!mb-0" : "!mx-4 !mb-4 !mt-0"} onSubmit={onMessageSend}/>
            }
        </div>
    )
}

export default Thread