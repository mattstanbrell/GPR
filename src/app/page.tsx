import SignInButton from "./components/SignInButton";
import { redirect } from "next/navigation";
import { AuthGetCurrentUserServer } from "@/utils/amplifyServerUtils";

export default async function Home() {
	const user = await AuthGetCurrentUserServer();
	if (user) {
		redirect("/todo");
	}

	return (
		<main className="govuk-main-wrapper">
			<div className="govuk-width-container">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-two-thirds">
						<h1 className="govuk-heading-xl">
							{/* Welcome to Hounslow Critical Service */}
							Welcome to Example
						</h1>
						<p className="govuk-body">Please sign in to access the service.</p>
						<SignInButton />
					</div>
				</div>
			</div>
		</main>
	);
}
