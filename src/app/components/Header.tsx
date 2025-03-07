
'use client'

import Menu from '@/app/components/navigation/Menu';
import useIsMobileWindowSize from '@/utils/responsivenessHelpers'

const Header = ({toggleMobileMenu, isMenuOpen, isSignedIn, handleClick} : {
	toggleMobileMenu: () => void, 
	isMenuOpen: boolean,
	isSignedIn: boolean,
	handleClick: () => void
}) => {

    const isMobile = useIsMobileWindowSize();

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