import { useEffect, useState } from "react";

const mediumWindowSize = 768;

export const useIsMobileWindowSize = () => {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < mediumWindowSize);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return isMobile;
};

export const useResponsiveMenu = (initialState = false) => {
	const [isMenuOpen, setIsMenuOpen] = useState(initialState);
	const isMobile = useIsMobileWindowSize();

	useEffect(() => {
		if (!isMobile) {
			setIsMenuOpen(false);
		}
	}, [isMobile]);

	const toggleMobileMenu = () => {
		if (isMobile) {
			setIsMenuOpen(!isMenuOpen);
		}
	};

	return {
		isMenuOpen,
		isMobile,
		toggleMobileMenu,
	};
};

export default useIsMobileWindowSize;
