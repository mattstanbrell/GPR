'use client';

import { useState } from "react";
import ThreadsSidebar from "./ThreadsSidebar";
import Thread from "./Thread";
import { ThreadType } from "./types";
import useIsMobileWindowSize from "@/utils/responsivenessHelpers";
import { useUserModel } from "@/utils/authenticationUtils";
import { PrimaryButton } from "../util/Button";
import { seed, displayBackend, deleteModels } from "./dummy";


interface ThreadsContainerProps {
    thread?: ThreadType  | null
    threads?: ThreadType[] | null
    loadingThreads?: boolean
    loadingThread?: boolean
    startWithSidebar ?: boolean
}

const ThreadsContainer = ({thread, threads, loadingThread, loadingThreads, startWithSidebar = true} : ThreadsContainerProps) => {
    const isMobile = useIsMobileWindowSize();
    const [viewSidebar, setViewSidebar] = useState(startWithSidebar); //When the screen is mobile, the sidebar is hidden by default
    const currentUser = useUserModel();


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
            {/* { currentUser &&          
                    <div className="flex flex-row h-10 justify-center">
                        <PrimaryButton onClick={() => seed(currentUser)} />
                        <PrimaryButton onClick={() => displayBackend()} />
                        <PrimaryButton onClick={() => deleteModels(currentUser)} />
                    </div>
            } */}
        </div>
    )
}


export default ThreadsContainer
