"use client";

import Menu from "@/app/components/navigation/Menu";
import Link from "next/link";
import { HOME } from "@/app/constants/urls";
import { useContext } from "react";
import { AppContext } from "../layout";

const Header = ({
	toggleMobileMenu,
	isMenuOpen,
	isSignedIn,
	handleClick,
}: {
	toggleMobileMenu: () => void;
	isMenuOpen: boolean;
	isSignedIn: boolean;
	handleClick: () => void;
}) => {
	const { isMobile } = useContext(AppContext)

	const handleAudilyClick = () => {
		if (isMenuOpen) {
			toggleMobileMenu();
		}
	};

	return (
		<header className="govuk-header" data-module="govuk-header">
			<div className="govuk-header__container govuk-width-container">
				<div className=" w-full text-white flex gap-2 mb-1 mt-2">
					<Link
						href={HOME}
						className="text-4xl font-bold no-underline text-white"
						onClick={handleAudilyClick}
					>
						Audily
					</Link>
					<Menu
						isSignedIn={isSignedIn}
						isMobile={isMobile}
						toggleMobileMenu={toggleMobileMenu}
						isMenuOpen={isMenuOpen}
						handleClick={handleClick}
					/>
				</div>
			</div>
		</header>
	);
};

export default Header;
