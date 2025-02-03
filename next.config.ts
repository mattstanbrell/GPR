import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	sassOptions: {
		quietDeps: true, // Suppress GOV.UK deprecation warnings
	},
};

export default nextConfig;
