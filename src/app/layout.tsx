'use client'

import { Lexend } from "next/font/google";
import "./globals.scss";
import ConfigureAmplifyClientSide from "./components/ConfigureAmplify";
import { audilyPrimary } from "./theme";
import { GovUKFrontend } from "./components/GovUKInitialiser";
import Header from '@/app/components/Header';
import FullscreenMenu from '@/app/components/navigation/FullscreenMenu';
import { useState, useEffect } from "react";
import { Hub } from "aws-amplify/utils";
import { getCurrentUser } from "aws-amplify/auth";
import { HOME } from "@/app/constants/urls";
import { useRouter } from "next/navigation";
import { signInWithRedirect, signOut } from "aws-amplify/auth";

// Alternative font which was used in the figma design
const lexend = Lexend({
	subsets: ["latin"],
	style: ["normal"],
	weight: ["400", "700"],
	display: "swap",
	variable: "--font-lexend",
});

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
	const router = useRouter();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isSignedIn, setIsSignedIn] = useState(false);

	const toggleMobileMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	}
	
	useEffect(() => {
		Hub.listen("auth", ({ payload }) => {
			if (payload.event === "signInWithRedirect") {
				router.push(HOME);
			}
			if (payload.event === "signedOut") {
				setIsSignedIn(false);
				router.push("/");
			}
		});

		getCurrentUser()
			.then(() => setIsSignedIn(true))
			.catch(() => setIsSignedIn(false));
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
		<html
			lang="en"
			className={`${lexend.className} antialiased govuk-template`}
		>
			<head>
				<meta name="theme-color" content={audilyPrimary} />
			</head>
			{
				isMenuOpen ? (
					<body className="govuk-template__body w-full h-[100vh]">
						<Header toggleMobileMenu={toggleMobileMenu} isMenuOpen={isMenuOpen} isSignedIn={isSignedIn} handleClick={handleClick}/>
						<FullscreenMenu handleToggle={toggleMobileMenu} handleClick={ handleClick } />
					</body>
				) : (				
					<body className="govuk-template__body">
						<ConfigureAmplifyClientSide />
						<GovUKFrontend />
						<Header toggleMobileMenu={toggleMobileMenu} isMenuOpen={isMenuOpen} isSignedIn={isSignedIn} handleClick={handleClick}/>
						<div className="govuk-width-container">
							<main className="govuk-main-wrapper">{children}</main>
						</div>
						<footer className="govuk-footer">
							<div className="govuk-width-container">
								<div className="govuk-footer__meta">
									<div className="govuk-footer__meta-item">
										© CRITICAL Channel 2025
									</div>
								</div>
							</div>
						</footer>
					</body>
				)
			}
		</html>
	);
}
