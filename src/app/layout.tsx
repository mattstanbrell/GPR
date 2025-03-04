import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.scss";
import ConfigureAmplifyClientSide from "./components/ConfigureAmplify";
import { audilyPrimary } from "./theme";
import Link from "next/link";
import { GovUKFrontend } from "./components/GovUKInitialiser";
import NavSignInButton from "./components/OldNavSignInButton";
import Header from '@/app/components/navigation/Header'

// Alternative font which was used in the figma design
const lexend = Lexend({
	subsets: ["latin"],
	style: ["normal"],
	weight: ["400", "700"],
	display: "swap",
	variable: "--font-lexend",
});

export const metadata: Metadata = {
	title: "Audily",
	description: "An auditable expenditure form management system",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${lexend.className} antialiased govuk-template`}
		>
			<head>
				<meta name="theme-color" content={audilyPrimary} />
			</head>
			<body className="govuk-template__body">
				<ConfigureAmplifyClientSide />
				<GovUKFrontend />
				<Header />
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
		</html>
	);
}
