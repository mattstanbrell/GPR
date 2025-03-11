'use client';

import { useState, useEffect, createContext } from "react";
import { getThreadsWithUser, getUnreadMessageNumber } from "@/utils/apis";
import { useUserModel } from "@/utils/authenticationUtils";
import { ThreadType, UserType } from "../components/threads/types";
import useIsMobileWindowSize from "@/utils/responsivenessHelpers";

export const ThreadsContext = createContext<
    { 
        threads: ThreadType[],
        loading: boolean,
        currentUser?: UserType | null,
        isMobile: boolean,
    }>({
        threads: [],
        loading: true, 
        currentUser: null,
        isMobile: false
    });

interface ThreadsLayoutProps {
    children: React.ReactNode;
}

export default function ThreadsLayout({ children } : ThreadsLayoutProps) {
    const currentUser = useUserModel();
    const isMobile = useIsMobileWindowSize();
    const [threads, setThreads] = useState<ThreadType[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        async function fetchThreads() {
            try{
                setLoading(true);

                // If there is no current user, return
                // But keep loading to true as user probably is being fetched
                if (!currentUser) return;

                // First fetch the threads
                const allThreads = await getThreadsWithUser(currentUser.id)

                
                if (allThreads){
                    // Fetch the thread details
                    const newThreads = await Promise.all(allThreads.map(async (thread) => {
                        const [{data: messages}, name, unreadCount] = await Promise.all([
                            thread.messages(),
                            thread.form().then((form) => form?.data?.title),
                            getUnreadMessageNumber(thread.id, currentUser.id)
                        ]);
                        
                        return {
                            ...thread,
                            lastMessage: messages[messages.length - 1],
                            unreadCount,
                            name: name || "No Title"
                        }
                    }));

                    setThreads(newThreads);
                }
                setLoading(false);

            } catch (error) {
                console.error(error);
            }
        }
        fetchThreads();
    }, [currentUser]);

    return (
        <ThreadsContext.Provider value={{ threads, loading, currentUser, isMobile }}>
            {children}
        </ThreadsContext.Provider>
    );
}
