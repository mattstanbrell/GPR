
import React from 'react';
import { HomeButton, UpdatesButton, SettingsButton, MenuSignOutButton } from '@/app/components/navigation/Buttons'

export const getMenuItems = (permissionGroup: string, isTitled: boolean): React.ReactElement[] => {
    switch (permissionGroup) {
        case 'SOCIAL_WORKER':
        case 'MANAGER':
        case 'ADMIN':
        default:
            return [
                <div key={ 0 }><HomeButton isTitled={ isTitled } /></div>, 
                <div key={ 1 }><UpdatesButton isTitled={ isTitled } /></div>, 
                <div key={ 2 }><SettingsButton isTitled={ isTitled } /></div>,
                <div key={ 3 }><MenuSignOutButton isTitled={ isTitled } /></div> 
            ] 
    }
}
