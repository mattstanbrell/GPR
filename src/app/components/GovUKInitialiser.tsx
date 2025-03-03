"use client";

import { useEffect } from "react";

export function GovUKFrontend() {
    useEffect(() => {
        // Add js-enabled and govuk-frontend-supported classes
        document.body.className += ` js-enabled${"noModule" in HTMLScriptElement.prototype ? " govuk-frontend-supported" : ""}`;

        // Initialize GOV.UK Frontend by dynamically importing the module.
        // This means that your bundle size can be reduced as these are only loaded on the client.
        (async () => {
            const { initAll } = await import("govuk-frontend");
            initAll();
        })();
    }, []);

    return null;
}