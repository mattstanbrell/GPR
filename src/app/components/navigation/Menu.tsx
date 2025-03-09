"use client";

import { getMenuItems } from "@/app/components/navigation/_helpers";
import { Button } from "@/app/components/navigation/Buttons";

const DesktopMenu = ({ handleClick }: { handleClick: () => void }) => {
	const userGroup = "";
	const isTitled = false;
	const menuItems = getMenuItems(userGroup, isTitled, handleClick);

	return (
		<div className="flex w-full justify-end pt-2">
			{menuItems.map((item, index) => (
				<div key={index}>{item}</div>
			))}
		</div>
	);
};

const MobileMenu = ({
	handleToggle,
	isMenuOpen,
}: { handleToggle: () => void; isMenuOpen: boolean }) => {
	const noTooltipName = "";

	return (
		<div
			className="flex w-full justify-end hover:cursor-pointer"
			onClick={handleToggle}
		>
			{isMenuOpen ? (
				<Button src="/close.svg" alt="" name={noTooltipName} isTitled={true} />
			) : (
				<Button src="/menu.svg" alt="" name={noTooltipName} isTitled={true} />
			)}
		</div>
	);
};

const Menu = ({
	isSignedIn,
	isMobile,
	toggleMobileMenu,
	isMenuOpen,
	handleClick,
}: {
	isSignedIn: boolean;
	isMobile: boolean;
	toggleMobileMenu: () => void;
	isMenuOpen: boolean;
	handleClick: () => void;
}) => {
	return (
		<>
			{isSignedIn && isMobile ? (
				<MobileMenu handleToggle={toggleMobileMenu} isMenuOpen={isMenuOpen} />
			) : isSignedIn ? (
				<DesktopMenu handleClick={handleClick} />
			) : (
				<></>
			)}
		</>
	);
};

export default Menu;
