
'use client'

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
}

const Home = () => {
	const userModel = useUserModel()

	return (
		<>
			{ userModel ? (
				<div>
					<h1 className="text-center pb-7">Welcome {userModel.firstName}!</h1>
					{ renderButtons(userModel.permissionGroup) }
				</div>
			) : (
				<div>
					<h3>Loading...</h3>
				</div>
			)}
		</>
	)
};

export default Home;
