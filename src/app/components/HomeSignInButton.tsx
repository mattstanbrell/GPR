"use client";

import { signInWithRedirect } from "aws-amplify/auth";

export default function HomeSignInButton() {
	return (
		<button
			onClick={() =>
				signInWithRedirect({
					provider: { custom: "MicrosoftEntraID" },
				})
			}
			className="govuk-button"
			data-module="govuk-button"
			type="button"
		>
			Sign in
		</button>
	);
}
