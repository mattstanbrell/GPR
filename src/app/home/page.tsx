"use client";

import { useState, useEffect, useContext } from "react" 
import SocialWorkerButtons from "../components/dashboard/SocialWorkerButtons";
import ManagerButtons from "../components/dashboard/ManagerButtons";
import AdminButtons from "../components/dashboard/AdminButtons";
import { AppContext } from "@/app/layout";


const renderButtons = (permissionGroup: "ADMIN" | "MANAGER" | "SOCIAL_WORKER" | null | undefined) => {
	switch (permissionGroup) {
		case "SOCIAL_WORKER":
			return <SocialWorkerButtons />;
		case "MANAGER":
			return <ManagerButtons />;
		case "ADMIN":
			return <AdminButtons />;
		default:
			return <h3>Error: Permission group not found. Please contact your IT to check you are in the correct group in Microsoft Entra.</h3>;
	}
};

const Home = () => {
	const { currentUser } = useContext(AppContext);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	
	useEffect(() => {
		setIsLoading(false)
	}, [currentUser])

	return (
		<>
			
			{ isLoading || !currentUser ? (
				<h3 className="text-center">Loading...</h3>
			) : (
				<>
					<h1 className="text-center pb-7">Welcome{` ${currentUser?.firstName}`}!</h1>
					{renderButtons(currentUser?.permissionGroup)}
				</>
			)}
		</>
	);
};

export default Home;
