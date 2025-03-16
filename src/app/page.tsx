'use client';

import HomeSignInButton from "./components/HomeSignInButton";
import { HOME } from "./constants/urls";
import { useRouter } from "next/navigation";
import { AppContext } from "./layout";
import { useContext, useEffect } from "react";


export default function Home() {
	const { currentUser: user, isLoading } = useContext(AppContext);
	const router = useRouter();

	useEffect(() => {
		if (user) {
			router.push(HOME);
		}
	}, [isLoading, user, router]);

	if (isLoading) {
		return <h3 className="text-center">Loading...</h3>;
	}

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
