
'use client'

import { signInWithRedirect, signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Hub } from "aws-amplify/utils";
import { getCurrentUser } from "aws-amplify/auth";
import { HOME } from "@/app/constants/urls";
import Menu from '@/app/components/navigation/Menu';

const Header = ({toggleMobileMenu, isMenuOpen} : {toggleMobileMenu: () => void, isMenuOpen: boolean}) => {
    const router = useRouter();
	const [isSignedIn, setIsSignedIn] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		Hub.listen("auth", ({ payload }) => {
			if (payload.event === "signInWithRedirect") {
				router.push(HOME);
			}
			if (payload.event === "signedOut") {
				setIsSignedIn(false);
				router.push("/");
			}
		});

		getCurrentUser()
			.then(() => setIsSignedIn(true))
			.catch(() => setIsSignedIn(false));
	}, [router]);

	const handleClick = async () => {
		if (isSignedIn) {
			await signOut();
		} else {
			await signInWithRedirect({
				provider: { custom: "MicrosoftEntraID" },
			});
		}
	};

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