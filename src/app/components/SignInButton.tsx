"use client";

import { signInWithRedirect, signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Hub } from "aws-amplify/utils";
import { getCurrentUser } from "aws-amplify/auth";
import { HOME } from "../constants/urls";

export default function SignInButton() {
	const router = useRouter();
	const [isSignedIn, setIsSignedIn] = useState(false);

	useEffect(() => {
		Hub.listen("auth", ({ payload }) => {
			if (payload.event === "signInWithRedirect") {
				router.push(HOME);
			}
		});

		// Check if already authenticated
		getCurrentUser()
			.then(() => router.push(HOME))
			.catch(() => {
				/* Not signed in */
			});
	}, [router]);

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
		<a
			onClick={handleClick}
			className="govuk-header__link"
			style={{ cursor: "pointer" }}
		>
			{isSignedIn ? "Sign out" : "Sign in"}
		</a>
	);
}
