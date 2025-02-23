import { cookies } from "next/headers";

import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/api";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth/server";

import type { Schema } from "../../amplify/data/resource";
import outputs from "../../amplify_outputs.json";

export const { runWithAmplifyServerContext } = createServerRunner({
	config: outputs,
});

export const cookiesClient = generateServerClientUsingCookies<Schema>({
	config: outputs,
	cookies,
});

export async function isAuthenticated() {
	try {
		const session = await runWithAmplifyServerContext({
			nextServerContext: { cookies },
			operation: async (contextSpec) => {
				const session = await fetchAuthSession(contextSpec, {});
				return session.tokens !== undefined;
			},
		});
		return session;
	} catch (error) {
		console.error("[Auth] Session check error:", error);
		return false;
	}
}

export async function AuthGetCurrentUserServer() {
	try {
		const authenticated = await isAuthenticated();
		if (!authenticated) {
			return null;
		}

		const currentUser = await runWithAmplifyServerContext({
			nextServerContext: { cookies },
			operation: (contextSpec) => getCurrentUser(contextSpec),
		});
		return currentUser;
	} catch (error) {
		console.error("[Auth] Get current user error:", error);
		return null;
	}
}
