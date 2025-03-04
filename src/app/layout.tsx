'use client'

import type { metadata } from "@/app/metadata";
import { Lexend } from "next/font/google";
import "./globals.scss";
import ConfigureAmplifyClientSide from "./components/ConfigureAmplify";
import { audilyPrimary } from "./theme";
import { GovUKFrontend } from "./components/GovUKInitialiser";
import Header from '@/app/components/navigation/Header';
import FullscreenMenu from '@/app/components/navigation/FullscreenMenu';
import { useState } from "react";

// Alternative font which was used in the figma design
const lexend = Lexend({
	subsets: ["latin"],
	style: ["normal"],
	weight: ["400", "700"],
	display: "swap",
	variable: "--font-lexend",
});

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	}

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
						<Header toggleMobileMenu={toggleMobileMenu} isMenuOpen={isMenuOpen} />
						<FullscreenMenu handleToggle={toggleMobileMenu} />
					</body>
				) : (				
					<body className="govuk-template__body">
						<ConfigureAmplifyClientSide />
						<GovUKFrontend />
						<Header toggleMobileMenu={toggleMobileMenu} isMenuOpen={isMenuOpen} />
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
