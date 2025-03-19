'use client';

import HomeSignInButton from "./components/HomeSignInButton";
import { HOME } from "./constants/urls";
import { useRouter } from "next/navigation";
import { AppContext } from "./layout";
import { useContext, useEffect } from "react";


export default function Home() {
	const { isSignedIn } = useContext(AppContext);
	const router = useRouter();

	useEffect(() => {
		if (isSignedIn) {
			router.push(HOME);
		}
	}, [isSignedIn, router]);

	return (
		<main className="govuk-main-wrapper">
			<div className="govuk-width-container">
				<div className="govuk-grid-row">
					<div className="govuk-grid-column-two-thirds">
						<h1>Welcome to Audily</h1>
						<p className="govuk-body">Please sign in to access the service.</p>
						<HomeSignInButton />
					</div>
				</div>
			</div>
		</main>
	);
}
