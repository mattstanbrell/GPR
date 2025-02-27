import HomeSignInButton from "./components/HomeSignInButton";
import { HOME } from "./constants/urls";
import { redirect } from "next/navigation";
import { AuthGetCurrentUserServer } from "@/utils/amplifyServerUtils";

export default async function Home() {
	const user = await AuthGetCurrentUserServer();
	if (user) {
		redirect(HOME);
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


