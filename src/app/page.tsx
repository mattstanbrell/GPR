import HomeSignInButton from "./components/HomeSignInButton";
import { redirect } from "next/navigation";
import { AuthGetCurrentUserServer } from "@/utils/amplifyServerUtils";

export default async function Home() {
	const user = await AuthGetCurrentUserServer();

	// Only redirect if we have a valid user
	if (user?.userId) {
		redirect("/home");
	}

	return (
		<main className="govuk-main-wrapper">
			<div className="govuk-width-container">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-two-thirds">
						<h1 className="govuk-heading-xl">Welcome to Audily</h1>
						<p className="govuk-body">Please sign in to access the service.</p>
						<HomeSignInButton />
					</div>
				</div>
			</div>
		</main>
	);
}
