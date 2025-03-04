import ThreadRow from "./ThreadRow"
import Image from "next/image"


interface ThreadsSidebarProps {
    threads: ThreadType[]
    className?: string
    selectedId?: string
    isMobile?: boolean
}

const ThreadsSidebar = ({className, threads, selectedId, isMobile} : ThreadsSidebarProps) => {
    return (
        <div className={`flex flex-col ${className}`}>
            <div className="relative font-bold flex-1 min-h-20 text-3xl w-full app-keep app-background justify-self-center content-center">
                <p className="justify-self-center app-background">All Threads</p>
                {isMobile ? <Image 
                    src="/more-options.svg" 
                    alt="More Options" 
                    width={30} 
                    height={30}
                    className="absolute right-2 bottom-6 filter-(--color-background-lightest-filter)"
                /> : null}
            </div>
            <table className="flex flex-col border-0">
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
