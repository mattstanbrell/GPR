"use client";

import Image from "next/image";
import Link from "next/link";
import { HOME, UPDATES, SETTINGS } from "@/app/constants/urls";

const desktopIconSize = 25;
const mobileIconSize = 50;

const ButtonImage = ({
	src,
	alt,
	width,
	height,
}: { src: string; alt: string; width: number; height: number }) => {
	return (
		<Image
			src={src}
			alt={alt}
			width={width}
			height={height}
			priority
			style={{ filter: "var(--hounslow-menu-icon-filter)" }}
		/>
	);
};

const Button = ({
	src,
	alt,
	name,
	isTitled,
}: { src: string; alt: string; name: string; isTitled: boolean }) => {
	return (
		<>
			{!isTitled ? (
				<div title={name} className="hover:cursor-pointer pl-5">
					<ButtonImage
						src={src}
						alt={alt}
						width={desktopIconSize}
						height={desktopIconSize}
					/>
				</div>
			) : (
				<div className="flex hover:cursor-pointer">
					<div title={name} className="hover:cursor-pointer">
						<ButtonImage
							src={src}
							alt={alt}
							width={mobileIconSize}
							height={mobileIconSize}
						/>
					</div>
					<div className="pt-1 ml-5 text-3xl font-bold">{name}</div>
				</div>
			)}
		</>
	);
};

const LinkedButton = ({
	pageUrl,
	imageSrc,
	imageAlt,
	name,
	isTitled,
}: {
	pageUrl: string;
	imageSrc: string;
	imageAlt: string;
	name: string;
	isTitled: boolean;
}) => {
	return (
		<Link href={pageUrl}>
			<Button src={imageSrc} alt={imageAlt} name={name} isTitled={isTitled} />
		</Link>
	);
};

const HomeButton = ({ isTitled }: { isTitled: boolean }) => {
	const url = HOME;
	const src = "/home.svg";
	const alt = "A picture of a house";
	const name = "Home";

	return (
		<LinkedButton
			pageUrl={url}
			imageSrc={src}
			imageAlt={alt}
			name={name}
			isTitled={isTitled}
		/>
	);
};

const UpdatesButton = ({ isTitled }: { isTitled: boolean }) => {
	const url = UPDATES;
	const src = "/updates.svg";
	const alt = "A picture of a circle with an i in the middle.";
	const name = "Updates";

	return (
		<LinkedButton
			pageUrl={url}
			imageSrc={src}
			imageAlt={alt}
			name={name}
			isTitled={isTitled}
		/>
	);
};

const SettingsButton = ({ isTitled }: { isTitled: boolean }) => {
	const url = SETTINGS;
	const src = "/settings.svg";
	const alt = "A picture of a cog";
	const name = "Settings";

	return (
		<LinkedButton
			pageUrl={url}
			imageSrc={src}
			imageAlt={alt}
			name={name}
			isTitled={isTitled}
		/>
	);
};

const MenuSignOutButton = ({
	isTitled,
	handleSignOut,
}: { isTitled: boolean; handleSignOut: () => void }) => {
	const src = "/signout.svg";
	const alt = "A picture of a door with an exit symbol";
	const name = "Sign Out";

	return (
		<div onClick={handleSignOut}>
			<Button src={src} alt={alt} name={name} isTitled={isTitled} />
		</div>
	);
};

export {
	ButtonImage,
	Button,
	LinkedButton,
	HomeButton,
	UpdatesButton,
	SettingsButton,
	MenuSignOutButton,
};
