import { defineFunction, secret } from "@aws-amplify/backend";

export const financeCode = defineFunction({
	name: "financeCode",
	timeoutSeconds: 300,
	environment: {
		OPENAI_API_KEY: secret("OPENAI_API_KEY"),
	},
});
