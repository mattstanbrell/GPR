import { a, defineData, type ClientSchema } from "@aws-amplify/backend";
import { norm } from "../functions/norm/resource";

const schema = a.schema({
	User: a
		.model({
			email: a.string().required(),
			firstName: a.string().required(),
			lastName: a.string().required(),
			permissionGroup: a.enum(["ADMIN", "MANAGER", "SOCIAL_WORKER"]),
			lastLogin: a.datetime(),
			forms: a.hasMany("Form", "userID"),
			children: a.hasMany("UserChild", "userID"),
			audits: a.hasMany("AuditLog", "userID"),
		})
		.authorization((allow) => [allow.group("ADMIN"), allow.owner()]),

	Form: a
		.model({
			caseNumber: a.string(),
			reason: a.string(),
			amount: a.float(),
			dateRequired: a.customType({
				day: a.integer(),
				month: a.integer(),
				year: a.integer(),
			}),
			recipientDetails: a.customType({
				name: a.customType({
					firstName: a.string(),
					lastName: a.string(),
				}),
				address: a.customType({
					lineOne: a.string(),
					lineTwo: a.string(),
					townOrCity: a.string(),
					postcode: a.string(),
				}),
			}),
			status: a.enum([
				"DRAFT",
				"SUBMITTED",
				"AUTHORISED",
				"VALIDATED",
				"COMPLETED",
			]),
			receipt: a.hasMany("Receipt", "formID"),
			conversations: a.hasMany("NormConversation", "formID"),
			userID: a.id(),
			user: a.belongsTo("User", "userID"),
			childID: a.id(),
			child: a.belongsTo("Child", "childID"),
			audits: a.hasMany("AuditLog", "formID"),
		})
		.authorization((allow) => [
			allow
				.publicApiKey() // why?
				.to(["read"]),
			allow.group("ADMIN"),
			allow.owner(),
		]),

	// Todo: a.model({
	//   content: a.string(),
	// }).authorization((allow) => [allow.owner()]),

	Child: a
		.model({
			firstName: a.string().required(),
			lastName: a.string().required(),
			dateOfBirth: a.date().required(),
			sex: a.string().required(),
			gender: a.string().required(),
			user: a.hasMany("UserChild", "childID"),
			form: a.hasMany("Form", "childID"),
		})
		.authorization((allow) => [allow.group("ADMIN"), allow.owner()]),

	Receipt: a
		.model({
			formID: a.id(),
			form: a.belongsTo("Form", "formID"),
			transactionDate: a.date(),
			merchantName: a.string(),
			paymentMethod: a.string(),
			subtotal: a.float(),
			itemDesc: a.string(),
		})
		.authorization((allow) => [allow.group("ADMIN"), allow.owner()]),

	AuditLog: a
		.model({
			action: a.string().required(),
			date: a.date().required(),
			userID: a.id(),
			user: a.belongsTo("User", "userID"),
			formID: a.id(),
			form: a.belongsTo("Form", "formID"),
		})
		.authorization((allow) => [
			allow.owner().to(["read"]),
			allow.group("ADMIN"),
		]),

	UserChild: a
		.model({
			childID: a.id().required(),
			userID: a.id().required(),
			child: a.belongsTo("Child", "childID"),
			user: a.belongsTo("User", "userID"),
		})
		.authorization((allow) => allow.publicApiKey()), // why?

	Norm: a
		.query()
		.arguments({
			conversationID: a.id(), // Not required if first message
			messages: a.string().required(), // Full conversation history
			formID: a.id().required(),
			currentFormState: a.string().required(),
		})
		.returns(
			a.customType({
				conversationID: a.id().required(),
				messages: a.string().required(), // Full conversation history
				followUp: a.string(), // Follow up question/statement from Norm
				formID: a.id().required(),
				currentFormState: a.string().required(),
			}),
		)
		.authorization((allow) => [allow.authenticated()])
		.handler(a.handler.function(norm)),

	NormConversation: a
		.model({
			messages: a.string().required(),
			formID: a.id().required(),
			form: a.belongsTo("Form", "formID"),
			currentFormState: a.string().required(),
		})
		.authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
	schema,
	authorizationModes: {
		defaultAuthorizationMode: "userPool",
		apiKeyAuthorizationMode: {
			expiresInDays: 30,
		},
	},
});
