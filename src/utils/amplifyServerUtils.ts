import { cookies } from "next/headers";

import { createServerRunner } from "@aws-amplify/adapter-nextjs";
import { generateServerClientUsingCookies } from "@aws-amplify/adapter-nextjs/api";
import { getCurrentUser, fetchAuthSession, fetchUserAttributes } from "aws-amplify/auth/server";

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

export async function AuthGetUserAttributesServer() {
	try {
		const authenticated = await isAuthenticated();
		if (!authenticated) {
			return null;
		}

		const currentUser = await runWithAmplifyServerContext({
			nextServerContext: { cookies },
			operation: (contextSpec) => fetchUserAttributes(contextSpec),
		});
		return currentUser;
	} catch (error) {
		console.error("[Auth] Get current user error:", error);
		return null;
	}
}

export const getUserDetailsFromCookiesClient = async () => {
	const authenticatedUser = await AuthGetCurrentUserServer();
	if (!authenticatedUser) {
		return null;
	}

	// Get user attributes
	const userAttributes = await AuthGetUserAttributesServer();
	if (!userAttributes?.sub) {
		throw new Error("User sub not found in attributes");
	}

	// Construct the profileOwner in the same format as the post-authentication handler
	const profileOwner = `${userAttributes.sub}::${authenticatedUser.username}`;

	// Get user details from the database
	const { data, errors } = await runWithAmplifyServerContext({
		nextServerContext: { cookies },
		operation: async () => {
			return await cookiesClient.models.User.list({
				filter: { profileOwner: { eq: profileOwner } },
			});
		},
	});

	if (errors) {
		console.error("Error fetching user:", errors);
		throw new Error("Failed to fetch user details");
	}

	return data[0]
}
