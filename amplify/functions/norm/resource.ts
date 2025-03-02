import { defineFunction, secret } from "@aws-amplify/backend";

export const norm = defineFunction({
	name: "norm",
	timeoutSeconds: 300,
	environment: {
		OPENAI_API_KEY: secret("OPENAI_API_KEY"),
	},
});
