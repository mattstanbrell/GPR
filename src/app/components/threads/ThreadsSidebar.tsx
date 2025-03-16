'use client';

import ThreadRow from "./ThreadRow"
import Toggle from "./Toggle"
import { ThreadType } from "../../types/threads"


interface ThreadsSidebarProps {
    threads?: ThreadType[] | null
    sidebarToggle: () => void
    className?: string
    selectedId?: string
    isMobile?: boolean
    loading?: boolean
}

const ThreadsSidebar = ({ className, sidebarToggle, threads, selectedId, isMobile, loading }: ThreadsSidebarProps) => {
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
                    { 
                        loading ? 
                            <ThreadRow loading={true} />
                            :
                            (!threads  || threads.length == 0) ? 
                                <tr className="flex text-center"><td className="font-bold py-5 flex-1">No Threads yet!</td></tr>
                                :
                                threads.map((thread) => {
                                    return (
                                        <ThreadRow
                                            name={thread?.name}
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
