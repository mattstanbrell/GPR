import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	sassOptions: {
		quietDeps: true, // Suppress GOV.UK deprecation warnings
	},
	images: {
		// By default, Next.js blocks SVGs as they can contain malicious JavaScript.
		// This setting enables SVG support - safe in our case as we only use our own SVGs.
		dangerouslyAllowSVG: true,

		// Strict Content Security Policy for SVGs:
		// - 'default-src self': Only allow resources from our own domain
		// - 'script-src none': Completely block any scripts from running in SVGs
		// - 'sandbox': Further restrict SVG capabilities
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
	},
};

export default nextConfig;
