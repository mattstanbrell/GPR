"use client";

import { useEffect, useContext } from "react" 
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
			setTimeout(() => {return <h3>Error: Permission group not found. Please contact your IT to check you are in the correct group in Microsoft Entra.</h3>;},500)
	}
};

const Home = () => {
	const { currentUser, isLoading, isSignedIn } = useContext(AppContext);
	useEffect(() => {
	}, [currentUser, isSignedIn, isLoading]);
	
	return (
		<>
			
			{ isLoading || !isSignedIn || !currentUser ? (
				<h3 className="text-center">Loading...</h3>
			) : (
				<>
					<h1 className="text-center pb-7">Welcome{` ${currentUser?.firstName}`}!</h1>
					{(!(currentUser?.permissionGroup == "ADMIN") && !currentUser?.teamID) ?
						<>
							<h3 className="text-center text-xl text-(--color-reject)">You have not yet been assigned to a team in Audily</h3>
							<h3 className="text-center text-xl mb-5">Please ask your admin to rectify this</h3>
						</>
						: 
						null}	
					{renderButtons(currentUser?.permissionGroup)}
				</>
			)}
		</>
	);
};

export default Home;
