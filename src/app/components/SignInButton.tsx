"use client";

import { signInWithRedirect } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Hub } from "aws-amplify/utils";
import { getCurrentUser } from "aws-amplify/auth";

export default function SignInButton() {
	const router = useRouter();

	useEffect(() => {
		Hub.listen("auth", ({ payload }) => {
			if (payload.event === "signInWithRedirect") {
				router.push("/todo");
			}
		});

		// Check if already authenticated
		getCurrentUser()
			.then(() => router.push("/todo"))
			.catch(() => {
				/* Not signed in */
			});
	}, [router]);

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
			Sign in with Microsoft
		</button>
	);
}
