import { redirect } from "next/navigation";
import SocialWorkerButtons from "../components/dashboard/SocialWorkerButtons";
import ManagerButtons from "../components/dashboard/ManagerButtons";
import AdminButtons from "../components/dashboard/AdminButtons";


const exampleUser = {
	firstName: "John",
	permissionGroup: "admin"
}



function renderButtons(permissionGroup: string) {
	switch (permissionGroup) {
		case 'socialworker':
			return <SocialWorkerButtons />
		case 'manager':
			return <ManagerButtons />
		case 'admin':
			return <AdminButtons />
		default:
			return <div>This is the default home page, you should not be here</div>
	}
}

const Home = async () => {
	const user = exampleUser;
	if (!user) {
		redirect("/");
	}
	return (
		<div>
			<h1 className="text-center pb-7" style={{color: "var(--hounslow-primary)"}}>Welcome {user.firstName}!</h1>
			{renderButtons(user.permissionGroup)}
		</div>
	)
}


export default Home;
