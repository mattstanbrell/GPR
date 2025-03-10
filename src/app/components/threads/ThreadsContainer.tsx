'use client';
import { useEffect, useState } from "react";
import ThreadsSidebar from "./ThreadsSidebar";
import Thread from "./Thread";


const threads = [
    {
        name: "Bob",
        threadId: "1",
        message: "I'm unsure why that didn't work",
        unreadCount: 2
    },
    {
        name: "James Suit",
        threadId: "2",
        unreadCount: 0,
        message: "I think we need to add more detail to the requirements"
    },
    {
        name: "Dave",
        threadId: "3",
        message: "I think we'll need more than that, what else is available?",
        unreadCount: 10
    }
]

interface ThreadsContainerProps {
    threadId?: string
    startWithSidebar ?: boolean
}

const ThreadsContainer = ({threadId, startWithSidebar = true} : ThreadsContainerProps) => {
    const [isMobile, setIsMobile] = useState(false);
    const [viewSidebar, setViewSidebar] = useState(startWithSidebar); //When the screen is mobile, the sidebar is hidden by default

    useEffect(() => {
        const mediumWindowSize = 768;
        const handleResize = () => {
            setIsMobile(window.innerWidth < mediumWindowSize);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex flex-row">
            {isMobile && !viewSidebar ?
                null :
                <ThreadsSidebar 
                    threads={threads}
                    sidebarToggle={() => setViewSidebar(!viewSidebar)}
                    selectedId={threadId} 
                    isMobile={isMobile} 
                    className={`${!isMobile? " w-1/3" : "w-full" } shrink-1 preset-secondary`} />
            }
            {isMobile && viewSidebar ? 
                null : 
                <Thread 
                    threadId={threadId}
                    sidebarToggle={() => setViewSidebar(!viewSidebar)} 
                    isMobile={isMobile} 
                    className="flex-1 grow" />
            }
        </div>
    )
}


export default ThreadsContainer
