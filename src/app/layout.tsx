"use client";

import { Lexend } from "next/font/google";
import "./globals.scss";
import ConfigureAmplifyClientSide from "./components/ConfigureAmplify";
import { audilyPrimary } from "./theme";
import { GovUKFrontend } from "./components/GovUKInitialiser";
import Header from "@/app/components/Header";
import FullscreenMenu from "@/app/components/navigation/FullscreenMenu";
import { useState, useEffect, createContext } from "react";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import useIsMobileWindowSize, { useResponsiveMenu } from "@/utils/responsivenessHelpers";
import { User } from "./types/models";
import { getUserByEmail } from "@/utils/apis";
import { usePathname } from "next/navigation";

// Alternative font which was used in the figma design
const lexend = Lexend({
	subsets: ["latin"],
	style: ["normal"],
	weight: ["400", "700"],
	display: "swap",
	variable: "--font-lexend",
});

export const AppContext = createContext<{
	currentUser?: User | null;
	isSignedIn: boolean;
	setUser: (user: User) => void;
	isMobile: boolean;
	isLoading: boolean;
}>({
	currentUser: null,
	isSignedIn: false,
	setUser: () => {},
	isMobile: false,
	isLoading: true,
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const { isMenuOpen, toggleMobileMenu } = useResponsiveMenu(false);
	const [currentUser, setUser] = useState<User | null>(null);
	const isMobile = useIsMobileWindowSize();
	const [isSignedIn, setIsSignedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const pathname = usePathname();

	// Check if current page is form page
	const isFormPage = pathname?.startsWith("/form");
	// Hide footer on form pages in mobile view
	const hideFooter = isMobile && isFormPage;

	useEffect(() => {
		const fetchUserModel = async () => {
			try {
				const userAttributes = await fetchUserAttributes();
				const data = await getUserByEmail(userAttributes ? userAttributes.email : "");
				if (!data) {
					setUser(data);
					setIsSignedIn(false);
				} else {
					setUser(data);
					setIsSignedIn(true);
				}
			} catch (error) {
				console.error("Error fetching user model:", error);
				setUser(null);
				setIsSignedIn(false);
			} finally {
				setIsLoading(false);
			}
		};

		getCurrentUser()
			.then(() => {
				fetchUserModel();
			})
			.catch(() => {
				setUser(null);
				setIsSignedIn(false);
				setIsLoading(false);
			});
	}, []);

	return (
		<AppContext.Provider value={{ currentUser, isSignedIn, setUser, isMobile, isLoading }}>
			<html lang="en" className={`${lexend.className} antialiased govuk-template`}>
				<head>
					<meta name="theme-color" content={audilyPrimary} />
				</head>
				{isMenuOpen ? (
					<body className="govuk-template__body w-full h-[100vh]">
						<Header
							toggleMobileMenu={toggleMobileMenu}
							isMenuOpen={isMenuOpen}
							isSignedIn={isSignedIn}
						/>
						<FullscreenMenu
							handleToggle={toggleMobileMenu}
						/>
					</body>
				) : (
					<body className="govuk-template__body">
						<ConfigureAmplifyClientSide />
						<GovUKFrontend />
						<Header
							toggleMobileMenu={toggleMobileMenu}
							isMenuOpen={isMenuOpen}
							isSignedIn={isSignedIn}
						/>
						<div className="govuk-width-container">
							<main className="govuk-main-wrapper">{children}</main>
						</div>
						{!hideFooter && (
							<footer className="govuk-footer">
								<div className="govuk-width-container">
									<div className="govuk-footer__meta">
										<div className="govuk-footer__meta-item">© CRITICAL Channel 2025</div>
									</div>
								</div>
							</footer>
						)}
					</body>
				)}
			</html>
		</AppContext.Provider>
	);
}
