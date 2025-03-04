"use client";

import Image from 'next/image'
import Link from 'next/link'
import { HOME, UPDATES, SETTINGS } from '@/app/constants/urls'

const Button = (
	{pageUrl, imageSrc, imageAlt, name} :
	{pageUrl: string, 
	imageSrc: string,
	imageAlt: string, 
	name: string}
) => {
	return (
		<div title={ name }>
			<Link href={ pageUrl } className='flex hover:cursor-pointer ml-5'>
				<Image 
					src={ imageSrc }
					alt={ imageAlt }
					width={ 25 }
					height={ 25 }
					style={{filter: "var(--hounslow-menu-icon-filter)"}}
				/>
			</Link>
		</div>
	);
}

const HomeButton = () => {
	return <Button pageUrl={ HOME } imageSrc='/home.svg' imageAlt='A picture of a house' name='Home' />;
}
const UpdatesButton = () => {
	return <Button pageUrl={ UPDATES } imageSrc='/updates.svg' imageAlt='A picture of a circle with an i in the middle.' name='Updates' />;
} 	
const SettingsButton = () => {
	return <Button pageUrl={ SETTINGS } imageSrc='/settings.svg' imageAlt='A picture of a cog' name='Settings' />;
} 

export { 
	Button,
	HomeButton, 
	UpdatesButton, 
	SettingsButton 
};