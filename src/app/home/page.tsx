// import { redirect } from "next/navigation";
// import SocialWorkerButtons from "../components/dashboard/SocialWorkerButtons";
// import ManagerButtons from "../components/dashboard/ManagerButtons";
// import AdminButtons from "../components/dashboard/AdminButtons";
//
//
// const exampleUser = {
// 	firstName: "John",
// 	permissionGroup: "admin"
// }
//
//
//
// function renderButtons(permissionGroup: string) {
// 	switch (permissionGroup) {
// 		case 'socialworker':
// 			return <SocialWorkerButtons />
// 		case 'manager':
// 			return <ManagerButtons />
// 		case 'admin':
// 			return <AdminButtons />
// 		default:
// 			return <div>This is the default home page, you should not be here</div>
// 	}
// }
//
// const Home = async () => {
// 	const user = exampleUser;
// 	if (!user) {
// 		redirect("/");
// 	}
// 	return (
// 		<div>
// 			<h1 className="text-center pb-7" style={{color: "var(--hounslow-primary)"}}>Welcome {user.firstName}!</h1>
// 			{renderButtons(user.permissionGroup)}
// 		</div>
// 	)
// }
//
//
// export default Home;

//src/app/page.tsx

import CreateThreadForm from "../components/createThreadForm";
import ThreadList from "../components/threadList";
import CreateUserForm from "../components/createUserForm";
import UserList from "../components/userList";
import CreateUserThreadForm from "../components/createUserThreadForm";
import UserThreadList from "../components/userThreadList";
import CreateFormForm from "../components/createFormForm";
import FormList from "../components/formList";
import CreateFormAssigneeForm from "../components/createFormAssigneeForm";
import FormAssigneeList from "../components/formAssigneeList";
import CreateMessageForm from "../components/createMessageForm";
import MessageList from "../components/messageList";
import UserMessageList from "../components/userMessageList";
import ConstantTest from "../components/constantTest";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<CreateUserForm/>
			<UserList/>
			<CreateMessageForm/>
			<MessageList/>
			<CreateThreadForm/>
			<ThreadList/>
			<CreateUserThreadForm/>
			<UserThreadList/>
			<CreateFormForm/>
			<FormList/>
			<CreateFormAssigneeForm/>
			<FormAssigneeList/>
			<UserMessageList/>
			<ConstantTest/>
		</main>
	);
}