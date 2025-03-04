"use client";

import Image from 'next/image'
import Link from 'next/link'
import { HOME, UPDATES, SETTINGS } from '@/app/constants/urls'

const desktopIconSize = 25;
const mobileIconSize = 50;

const Button = (
	{src, alt, width, height, name} :
	{src: string,
	alt: string, 
	width: number,
	height: number,
	name: string}
) => {
	return (
			<div title={ name } className='hover:cursor-pointer'>
				<Image 
					src={ src }
					alt={ alt }
					width={ width }
					height={ height }
					style={{filter: "var(--hounslow-menu-icon-filter)"}}
				/>
			</div>
	);
}

const TitledButton = (
	{src, alt, name} : {src: string, alt: string, name: string}
) => {
	return (
		<div className='flex hover:cursor-pointer'>
			<Button src={ src } alt={ alt } width={ mobileIconSize } height={ mobileIconSize } name={ name }/>
			<div className="pt-1 ml-5 text-3xl font-bold">{ name }</div>
		</div>
	)
}

const LinkedButton = (
	{pageUrl, imageSrc, imageAlt, name, isTitled} :
	{pageUrl: string, 
	imageSrc: string,
	imageAlt: string, 
	name: string,
	isTitled: boolean}
) => {
	return (
		<Link href={ pageUrl }>
			{
				!(isTitled) ? (
					<div className='pl-5'>
						<Button src={ imageSrc } alt={ imageAlt } width={ desktopIconSize } height={ desktopIconSize } name={ name } />
					</div>
				) : (
					<TitledButton src={ imageSrc } alt={ imageAlt } name={ name } /> 
				)
			}
		</Link>
	);
}

const HomeButton = () => {
	return <LinkedButton pageUrl={ HOME } imageSrc='/home.svg' imageAlt='A picture of a house' name='Home' isTitled={ false } />;
}

const UpdatesButton = () => {
	return <LinkedButton pageUrl={ UPDATES } imageSrc='/updates.svg' imageAlt='A picture of a circle with an i in the middle.' name='Updates' isTitled={ false } />;
}

const SettingsButton = () => {
	return <LinkedButton pageUrl={ SETTINGS } imageSrc='/settings.svg' imageAlt='A picture of a cog' name='Settings' isTitled={ false } />;
} 

const MenuSignOutButton = ({isTitled, handleSignOut} : {isTitled: boolean, handleSignOut: () => void}) => {
	const name = "Sign Out";

	return (
		<div onClick={handleSignOut}>
			{
				
				!(isTitled) ? (
					<div className='pl-5'>
						<Button src='/signout.svg' alt='' width={ desktopIconSize } height={ desktopIconSize } name={ name } />
					</div>
				) : (
					<TitledButton src='/signout.svg' alt='' name={ name } />
				)
			}
		</div>
	)
}

const TitledHomeButton = () => {
	return <LinkedButton pageUrl={ HOME } imageSrc='/home.svg' imageAlt='A picture of a house' name='Home' isTitled={ true } />;
}

const TitledUpdatesButton = () => {
	return <LinkedButton pageUrl={ UPDATES } imageSrc='/updates.svg' imageAlt='A picture of a circle with an i in the middle.' name='Updates' isTitled={ true } />;
}

const TitledSettingsButton = () => {
	return <LinkedButton pageUrl={ SETTINGS } imageSrc='/settings.svg' imageAlt='A picture of a cog' name='Settings' isTitled={ true } />;
} 

export { 
	Button,
	TitledButton, 
	LinkedButton,
	HomeButton, 
	UpdatesButton, 
	SettingsButton,
	MenuSignOutButton, 
	TitledHomeButton,
	TitledUpdatesButton,
	TitledSettingsButton
};