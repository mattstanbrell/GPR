"use client";

import { HomeButton, UpdatesButton, SettingsButton } from '@/app/components/navigation/Buttons'

const Menu = () => {

	// load menu based on user group

	return (
		<>
			<HomeButton />
			<UpdatesButton />
			<SettingsButton />
		</>
	);
}

export default Menu;