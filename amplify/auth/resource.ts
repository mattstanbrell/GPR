import { defineAuth, secret } from "@aws-amplify/backend";
import { postAuthentication } from "./post-authentication/resource";

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
	loginWith: {
		email: true,
		externalProviders: {
			oidc: [
				{
					name: "MicrosoftEntraID",
					clientId: secret("MICROSOFT_CLIENT_ID"),
					clientSecret: secret("MICROSOFT_CLIENT_SECRET"),
					issuerUrl:
						"https://login.microsoftonline.com/4c70b964-f256-4054-ace6-6375714daa99/v2.0",
					scopes: ["openid", "profile", "email"],
					attributeMapping: {
						givenName: "given_name",
						familyName: "family_name",
						custom: {
							// this is a string (not an array) of group ids
							// eg '["cab6488b-12e6-4d6e-bdf0-6a2d254b2ec9","0989a8d5-c347-4ce1-9d50-c97641a4d3b5"]'
							// cab6488b-12e6-4d6e-bdf0-6a2d254b2ec9 = Administrators
							// 0989a8d5-c347-4ce1-9d50-c97641a4d3b5 = Managers
							// 2a53f41c-3491-40f2-919c-9500c71029b2 = Social Workers
							"custom:groups": "groups",
						},
					},
				},
			],
			logoutUrls: [
				"http://localhost:3000",
				"https://main.d2sc3b0jj94stq.amplifyapp.com",
				"https://fix-submissions.d2sc3b0jj94stq.amplifyapp.com"
			],
			callbackUrls: [
				"http://localhost:3000",
				"https://main.d2sc3b0jj94stq.amplifyapp.com",
				"https://fix-submissions.d2sc3b0jj94stq.amplifyapp.com"
			],
		},
	},
	userAttributes: {
		"custom:groups": {
			dataType: "String", // array not supported
			mutable: true,
			maxLen: 2048, // 2048 is the max this can be
		},
	},
	triggers: {
		postAuthentication,
	},
});
