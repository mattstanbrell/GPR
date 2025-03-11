'use client';

import { useEffect } from "react"
import ThreadRow from "./ThreadRow"
import Toggle from "./Toggle"
import { ThreadType } from "./types"
import { getUnreadMessageNumber } from "@/utils/apis"
import { useUserModel } from "@/utils/authenticationUtils";


interface ThreadsSidebarProps {
    threads: ThreadType[] | null
    sidebarToggle: () => void
    className?: string
    selectedId?: string
    isMobile?: boolean
}

const ThreadsSidebar = ({ className, sidebarToggle, threads, selectedId, isMobile }: ThreadsSidebarProps) => {
    const currentUser = useUserModel();

    useEffect(() => {
        async function fetchUnreadData() {
            if (!threads) return;
            if (!currentUser) return;
            
            try{
                for (const thread of threads) {
                    const [{data: messages}, unreadCount] = await Promise.all([
                        thread.messages(),
                        getUnreadMessageNumber(thread.id, currentUser.id)
                    ]);

                    thread.lastMessage = messages[messages.length - 1];
                    thread.unreadCount = unreadCount;
                }  
            } catch (error) {
                console.error(error);
            }
        }
        fetchUnreadData();
    }, [threads, currentUser])

    return (
        <div className={`flex flex-col ${className}`}>
            <div className="relative font-bold  min-h-28 text-3xl w-full app-background justify-self-center content-center">
                <p className="justify-self-center">All Threads</p>
                { isMobile &&
                    <Toggle
                        sidebarToggle={sidebarToggle}
                        className="absolute right-2 top-6 filter-(--color-background-lightest-filter)"
                    />
                }
            </div>
            <table className="flex flex-1 bg-(--color-background-medium) flex-col">
                <tbody className="flex flex-col">
                    { !threads ? 
                        <tr className="flex text-center"><td className="font-bold py-5 flex-1">No Threads yet!</td></tr>
                        :
                        threads.map((thread) => {
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
                        })
                    }
                </tbody>
            </table>
        </div>
    )
}


export default ThreadsSidebar
