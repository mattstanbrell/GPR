'use client';

import { useContext, useState } from "react";
import ThreadsSidebar from "./ThreadsSidebar";
import Thread from "./Thread";
import { ThreadType } from "./types";
import { ThreadsContext } from "@/app/threads/layout";
import Seeder from "./Seeder";





interface ThreadsContainerProps {
    thread?: ThreadType  | null
    threads?: ThreadType[] | null
    loadingThreads?: boolean
    loadingThread?: boolean
    startWithSidebar ?: boolean
}

const ThreadsContainer = ({thread, threads, loadingThread, loadingThreads, startWithSidebar = true} : ThreadsContainerProps) => {
    const { isMobile } = useContext(ThreadsContext);
    const [viewSidebar, setViewSidebar] = useState(startWithSidebar); //When the screen is mobile, the sidebar is hidden by default

    return (
        <div className="flex flex-col h-full">
            
            <div className="flex flex-row">
                
                { (!isMobile || viewSidebar) &&
                    <ThreadsSidebar 
                        threads={threads}
                        sidebarToggle={() => setViewSidebar(!viewSidebar)}
                        selectedId={thread?.id} 
                        isMobile={isMobile}
                        loading={loadingThreads}
                        className={`${!isMobile? " w-1/3" : "w-full" } shrink-1 preset-secondary`} />
                }
                { !(isMobile && viewSidebar) &&
                    <Thread 
                        thread={thread}
                        sidebarToggle={() => setViewSidebar(!viewSidebar)} 
                        isMobile={isMobile} 
                        loading={loadingThread}
                        className="flex-1 grow" />
                }
            </div>
            <Seeder />
        </div>
    )
}


export default ThreadsContainer
