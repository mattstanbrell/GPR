
import { useEffect, useState } from "react";

const useIsMobileWindowSize = () => {
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

    return isMobile
}

export default useIsMobileWindowSize;