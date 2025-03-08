import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	sassOptions: {
		quietDeps: true, // Suppress GOV.UK deprecation warnings
	},
	images: {
		// By default, Next.js blocks SVGs as they can contain malicious JavaScript.
		// This setting enables SVG support - safe in our case as we only use our own SVGs.
		dangerouslyAllowSVG: true,

		// Forces SVGs to download as files rather than being rendered directly in the browser.
		// This prevents any scripts within SVGs from executing, adding an extra layer of security.
		contentDispositionType: "attachment",

		// Strict Content Security Policy for SVGs:
		// - 'default-src self': Only allow resources from our own domain
		// - 'script-src none': Completely block any scripts from running in SVGs
		// - 'sandbox': Further restrict SVG capabilities
		// These security measures are required when enabling SVG support
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
};

export default nextConfig;
