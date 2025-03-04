
import React from 'react';
import { HomeButton, UpdatesButton, SettingsButton, MenuSignOutButton } from '@/app/components/navigation/Buttons'

export const getMenuItems = (permissionGroup: string, isTitled: boolean, handleClick: () => void): React.ReactElement[] => {
    switch (permissionGroup) {
        case 'SOCIAL_WORKER':
        case 'MANAGER':
        case 'ADMIN':
        default:
            return [
                <HomeButton isTitled={ isTitled } />, 
                <UpdatesButton isTitled={ isTitled } />, 
                <SettingsButton isTitled={ isTitled } />,
                <MenuSignOutButton isTitled={ isTitled } handleSignOut={handleClick} /> 
            ] 
    }
}
