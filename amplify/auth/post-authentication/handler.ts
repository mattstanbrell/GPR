import type { PostAuthenticationTriggerHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { env } from "$amplify/env/post-authentication";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import type { Schema } from "../../data/resource";
import { getPermissionGroup } from "./_helpers";

const { resourceConfig, libraryOptions } = await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);
const client = generateClient<Schema>();

export const handler: PostAuthenticationTriggerHandler = async (event) => {
	const userAttributes = event.request.userAttributes;

	if (
		"sub" in userAttributes &&
		"email" in userAttributes &&
		"given_name" in userAttributes &&
		"family_name" in userAttributes &&
		"custom:groups" in userAttributes
	) {
		// retrive all User models and filter to see if user exists
		const { data: users, errors } = await client.models.User.list({
			filter: { email: { eq: userAttributes.email } },
		});

		if (errors) {
			throw new Error("Failed to retrieve list of users from the database.");
		}

		const existingUser = users?.[0];

		// retrieve users' permission group and current date time.
		const OIDCGroupIds = JSON.parse(userAttributes["custom:groups"]) as string[];
		const permissionGroup = getPermissionGroup(OIDCGroupIds);
		const lastLogin = new Date().toISOString();

		if (existingUser) {
			// update existing User model.
			const { errors: updateErrors } = await client.models.User.update({
				id: existingUser.id,
				firstName: userAttributes.given_name,
				lastName: userAttributes.family_name,
				permissionGroup,
				lastLogin,
				profileOwner: `${userAttributes.sub}::${event.userName}`,
			});

			if (updateErrors) {
				throw new Error("Failed to update existing User model.");
			}
		} else {
			// create new User model.
			const { errors: createErrors } = await client.models.User.create({
				email: userAttributes.email,
				firstName: userAttributes.given_name,
				lastName: userAttributes.family_name,
				permissionGroup,
				lastLogin,
				profileOwner: `${userAttributes.sub}::${event.userName}`,
			});

			if (createErrors) {
				throw new Error("Failed to create a new User model.");
			}
		}
	}

	return event;
};
