"use client";

import { useState, useEffect } from "react" 
import SocialWorkerButtons from "../components/dashboard/SocialWorkerButtons";
import ManagerButtons from "../components/dashboard/ManagerButtons";
import AdminButtons from "../components/dashboard/AdminButtons";
import { useUserModel } from "@/utils/authenticationUtils";

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
	const userModel = useUserModel();
	const [isLoading, setIsLoading] = useState<boolean>(true);
	
	useEffect(() => {
		setIsLoading(false)
	}, [userModel])

	return (
		<>
			
			{ isLoading ? (
				<h3 className="text-center">Loading...</h3>
			) : (
				<>
					<h1 className="text-center pb-7">Welcome{` ${userModel?.firstName}`}!</h1>
					{renderButtons(userModel?.permissionGroup)}
				</>
			)}
		</>
	);
};

export default Home;
