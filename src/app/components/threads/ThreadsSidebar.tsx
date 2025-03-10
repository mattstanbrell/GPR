'use client';

import { useEffect } from "react"
import ThreadRow from "./ThreadRow"
import Toggle from "./Toggle"
import { ThreadType } from "./types"
import { getUnreadMessageNumber } from "@/utils/apis"
import { useAuth } from "@/utils/authHelpers"


interface ThreadsSidebarProps {
    threads: ThreadType[] | null
    sidebarToggle: () => void
    className?: string
    selectedId?: string
    isMobile?: boolean

}



const ThreadsSidebar = ({ className, sidebarToggle, threads, selectedId, isMobile }: ThreadsSidebarProps) => {
    const currentUser = useAuth();

    useEffect(() => {
        async function getLastMessage(thread: ThreadType) {
            const { data: messages } = await thread.messages();
            return messages[messages.length - 1];
        }

        async function getUnreadCount(thread: ThreadType, userID: string) {
            return await getUnreadMessageNumber(thread.id, userID);
        }

        async function fetchLastMessages() {
            if (threads && currentUser) {
                for (const thread of threads) {
                    const lastMessage = await getLastMessage(thread);
                    thread.lastMessage = lastMessage;

                    const unreadCount = await getUnreadCount(thread, currentUser.id);
                    thread.unreadCount = unreadCount;
                }
            }
        }
        fetchLastMessages();
    }, [threads])

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="relative font-bold  min-h-28 text-3xl w-full app-background justify-self-center content-center">
                <p className="justify-self-center">All Threads</p>
                {isMobile ?
                    <Toggle
                        sidebarToggle={sidebarToggle}
                        className="absolute right-2 top-6 filter-(--color-background-lightest-filter)"
                    /> : null
                }
            </div>
            <table className="flex flex-1 bg-(--color-background-medium) flex-col">
                <tbody className="flex flex-col">
                    {threads ? threads.map((thread) => {
                        return (
                            <ThreadRow
                                name={"PLACEHOLDER"}
                                threadId={thread.id}
                                message={thread.lastMessage?.content}
                                unreadCount={thread?.unreadCount || 0}
                                key={thread.id}
                                selected={selectedId == thread.id}
                            />
                        )
                    }) :
                    <tr className="flex text-center"><td className="font-bold pt-5 flex-1">No Threads yet!</td></tr>}
                </tbody>
            </table>
        </div>
    )
}


export default ThreadsSidebar
