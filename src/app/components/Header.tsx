
'use client'

import { useEffect, useState } from "react";
import Menu from '@/app/components/navigation/Menu';

const Header = ({toggleMobileMenu, isMenuOpen, isSignedIn, handleClick} : {
	toggleMobileMenu: () => void, 
	isMenuOpen: boolean,
	isSignedIn: boolean,
	handleClick: () => {}
}) => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
        const mediumWindowSize = 768;
        const handleResize = () => {
            setIsMobile(window.innerWidth < mediumWindowSize);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <header className="govuk-header" data-module="govuk-header">
            <div className="govuk-header__container govuk-width-container">
                <div className=" w-full text-white flex gap-2 mb-1 mt-2">
                    <h2 className='text-4xl font-bold'>Audily</h2>
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
    )
}

export default Header;