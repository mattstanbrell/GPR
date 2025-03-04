
'use client'

import { signInWithRedirect, signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Hub } from "aws-amplify/utils";
import { getCurrentUser } from "aws-amplify/auth";
import { HOME } from "@/app/constants/urls"
import Menu from '@/app/components/navigation/Menu'

const Header = () => {
    const router = useRouter();
	const [isSignedIn, setIsSignedIn] = useState(false);

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

		// Check if already authenticated
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

    return (
        <header className="govuk-header" data-module="govuk-header">
            <div className="govuk-header__container govuk-width-container">
                <div className=" w-full text-white flex gap-2 mb-1 mt-2">
                    <h2 className='text-3xl font-bold'>Audily</h2>
                    {
                        isSignedIn ? (                
                            <div className="flex w-full justify-end pt-2">
                                <Menu />
                                <a onClick={handleClick} className="govuk-header__link hover:cursor-pointer ml-5 mt-1">
                                    Sign out
                                </a>
		                    </div> 
                        ) : (
                            <></>
                        )
                    }
                </div>
            </div>
        </header>
    )
}

export default Header;