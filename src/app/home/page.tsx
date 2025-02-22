import { redirect } from "next/navigation";
import SocialWorkerButtons from "../components/dashboard/SocialWorkerButtons";
import ManagerButtons from "../components/dashboard/ManagerButtons";
import AdminButtons from "../components/dashboard/AdminButtons";


const exampleUser = {
	role: "socialworker"
}

function renderButtons(role: string) {
	switch (role) {
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
			{renderButtons(user.role)}
		</div>
	)
}


export default Home;