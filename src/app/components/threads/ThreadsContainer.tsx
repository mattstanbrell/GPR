'use client';
import { useEffect, useState } from "react";
import ThreadsSidebar from "./ThreadsSidebar";
import Thread from "./Thread";
import { getThreadbyID, getThreadsWithUser } from "@/utils/apis";
import { useAuth } from "@/utils/authHelpers";
import { ThreadType } from "./types";
import useIsMobileWindowSize from "@/utils/responsivenessHelpers";


interface ThreadsContainerProps {
    threadId?: string
    startWithSidebar ?: boolean
}

const ThreadsContainer = ({threadId, startWithSidebar = true} : ThreadsContainerProps) => {
    const isMobile = useIsMobileWindowSize();
    const [threads, setThreads] = useState<ThreadType[] | null>(null);
    const [currentThread, setCurrentThread] = useState<ThreadType | null>(null);
    const [viewSidebar, setViewSidebar] = useState(startWithSidebar); //When the screen is mobile, the sidebar is hidden by default
    const currentUser = useAuth()
    
    useEffect(() => {
        async function fetchThreads() {
            if(!currentUser) return;
            if(!threadId) return;

            try{
                const [threads, thread] = await Promise.all([
                    getThreadsWithUser(currentUser.id),
                    getThreadbyID(threadId)
                ]);

                setThreads(threads);
                setCurrentThread(thread);
            } catch (error) {
                console.error(error);
            }
        }
        fetchThreads();
    }, [currentUser, threadId]);

    return (
        <div className="flex flex-row">
            { (!isMobile || viewSidebar) &&
                <ThreadsSidebar 
                    threads={threads}
                    sidebarToggle={() => setViewSidebar(!viewSidebar)}
                    selectedId={threadId} 
                    isMobile={isMobile} 
                    className={`${!isMobile? " w-1/3" : "w-full" } shrink-1 preset-secondary`} />
            }
            { !(isMobile && viewSidebar) &&
                <Thread 
                    thread={currentThread}
                    sidebarToggle={() => setViewSidebar(!viewSidebar)} 
                    isMobile={isMobile} 
                    className="flex-1 grow" />
            }
        </div>
    )
}


export default ThreadsContainer
