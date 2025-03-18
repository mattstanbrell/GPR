"use client";

import { signInWithRedirect, signOut } from "aws-amplify/auth";
import { useContext } from "react";
import { AppContext } from "../layout";

export default function SignInButton() {
	const { isSignedIn } = useContext(AppContext);

	const handleClick = async () => {
		if (isSignedIn) {
			await signOut();
		} else {
			await signInWithRedirect({
				provider: { custom: "MicrosoftEntraID" },
			});
		}
	};

	return (
		<a onClick={handleClick} className="govuk-header__link" style={{ cursor: "pointer" }}>
			{isSignedIn ? "Sign out" : "Sign in"}
		</a>
	);
}
