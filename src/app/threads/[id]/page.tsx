'use client'

import ThreadsContainer from "@/app/components/threads/ThreadsContainer";
import { useContext, useEffect, useState } from "react";
import { ThreadsContext } from "../layout";
import { ThreadType } from "@/app/components/threads/types";
import { getThreadbyID, getUsersInThread, setThreadMessagesToRead } from "@/utils/apis";


const ThreadPage = ({ params }: { params: Promise<{ id: string }> }) => {
	const { threads, loading: loadingThreads, currentUser } = useContext(ThreadsContext);
	const [currentThread, setCurrentThread] = useState<ThreadType | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchThreads() {
			try {
				const {id: threadId} = await params;
				setLoading(true);

				// If there is no current user, return
				// But keep loading to true as user probably is being fetched
				if (!currentUser) return;

				if(!threadId) return;

				// First fetch the threads
				const thread = await getThreadbyID(threadId);

				if (!thread) return;


				// Fetch the thread details
				const [{data: messages}, name, allUsers, formId] = await Promise.all([
					thread.messages(),
					thread.form().then((form) => form?.data?.title),
					getUsersInThread(thread.id),
					thread.form().then((form) => form?.data?.id)
				]);
				setCurrentThread({
					...thread,
					allMessages: messages,
					name: name || "No Title",
					allUsers,
					formId
				});
				// set thread to read
				await setThreadMessagesToRead(thread.id, currentUser.id);
				console.log("Thread set to read");

				setLoading(false);

			} catch (error) {
				console.error(error);
			}
		}
		fetchThreads();
	}, [currentUser, params]);

	return (
		<ThreadsContainer 
			thread={currentThread} 
			threads={threads} 
			loadingThreads={loadingThreads}
			loadingThread={loading}
			startWithSidebar={false} 
		/>
	)
}

export default ThreadPage