import ThreadRow from "./ThreadRow"
import Toggle from "./Toggle"
import { ThreadType } from "./types"


interface ThreadsSidebarProps {
    threads: ThreadType[]
    sidebarToggle: () => void
    className?: string
    selectedId?: string
    isMobile?: boolean

}

const ThreadsSidebar = ({className, sidebarToggle, threads, selectedId, isMobile} : ThreadsSidebarProps) => {
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
                    {threads.map((thread) => (
                                <ThreadRow 
                                    name={thread.name} 
                                    threadId={thread.threadId} 
                                    message={thread.message} 
                                    unreadCount={thread.unreadCount} 
                                    key={thread.threadId}
                                    selected={selectedId == thread.threadId}
                                />
                    ))}
                </tbody>
            </table>
        </div>
    )
}


export default ThreadsSidebar
