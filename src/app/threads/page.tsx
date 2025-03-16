'use client';

import ThreadsContainer from "@/app/components/threads/ThreadsContainer";
import { ThreadsContext } from "./layout";
import { useContext } from "react";


const ThreadPage = () => {
	const { threads, loading } = useContext(ThreadsContext);
	
	return (
		<ThreadsContainer
			threads={threads}
			loadingThreads={loading}
		/>
	)
}

export default ThreadPage