import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.scss";
import ConfigureAmplifyClientSide from "./components/ConfigureAmplify";
import { hounslowPrimary } from "./theme";
import Link from "next/link";
import { GovUKFrontend } from "./components/GovUKInitialiser";

const atkinson = Atkinson_Hyperlegible({
	subsets: ["latin"],
	style: ["normal", "italic"],
	weight: ["400", "700"],
	display: "swap",
	variable: "--font-atkinson",
});

export const metadata: Metadata = {
	title: "Hounslow Critical Service",
	description: "",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${atkinson.className} antialiased govuk-template`}
		>
			<head>
				<meta name="theme-color" content={hounslowPrimary} />
			</head>
			<body className="govuk-template__body">
				<ConfigureAmplifyClientSide />
				<GovUKFrontend />
				<header className="govuk-header" data-module="govuk-header">
					<div className="govuk-header__container govuk-width-container">
						<div className="govuk-header__content">
							<Link
								href="/"
								className="govuk-header__link govuk-header__service-name"
							>
								Hounslow Critical Service
							</Link>
						</div>
					</div>
				</header>
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
