import { a, defineData, type ClientSchema } from "@aws-amplify/backend";
import { norm } from "../functions/norm/resource";
import { postAuthentication } from "../auth/post-authentication/resource";

const schema = a
	.schema({
		User: a
			.model({
				email: a.string().required(),
				firstName: a.string().required(),
				lastName: a.string().required(),
				permissionGroup: a.enum(["ADMIN", "MANAGER", "SOCIAL_WORKER"]),
				lastLogin: a.datetime(),
				createdForms: a.hasMany("Form", "creatorID"),
				assignments: a.hasMany("FormAssignee", "userID"),
				children: a.hasMany("UserChild", "userID"),
				audits: a.hasMany("AuditLog", "userID"),
				address: a.customType({
					lineOne: a.string(),
					lineTwo: a.string(),
					townOrCity: a.string(),
					postcode: a.string(),
				}),
				userSettings: a.customType({
					fontSize: a.integer(),
					font: a.string(),
					fontColour: a.string(),
					bgColour: a.string(),
					spacing: a.integer(),
				}),
			})
			.authorization((allow) => [
				allow.publicApiKey(),
				allow.authenticated()
			]),

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
				conversation: a.hasOne("NormConversation", "formID"),
				creatorID: a.id().required(),
				creator: a.belongsTo("User", "creatorID"),
				childID: a.id(),
				child: a.belongsTo("Child", "childID"),
				audits: a.hasMany("AuditLog", "formID"),
				feedback: a.string(),
				assignees: a.hasMany("FormAssignee", "formID"),
			})
			.authorization((allow) => [allow.authenticated()]),

		FormAssignee: a
			.model({
				formID: a.id().required(),
				userID: a.id().required(),
				form: a.belongsTo("Form", "formID"),
				user: a.belongsTo("User", "userID"),
			})
			.authorization((allow) => [allow.authenticated()]),

		Child: a
			.model({
				caseNumber: a.string().required(),
				firstName: a.string().required(),
				lastName: a.string().required(),
				dateOfBirth: a.date().required(),
				sex: a.string().required(),
				gender: a.string().required(),
				user: a.hasMany("UserChild", "childID"),
				form: a.hasMany("Form", "childID"),
			})
			.authorization((allow) => [allow.authenticated()]),

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
			.authorization((allow) => [allow.authenticated()]),

		AuditLog: a
			.model({
				action: a.string().required(),
				date: a.date().required(),
				userID: a.id(),
				user: a.belongsTo("User", "userID"),
				formID: a.id(),
				form: a.belongsTo("Form", "formID"),
			})
			.authorization((allow) => [allow.authenticated()]),

		UserChild: a
			.model({
				childID: a.id().required(),
				userID: a.id().required(),
				child: a.belongsTo("Child", "childID"),
				user: a.belongsTo("User", "userID"),
			})
			.authorization((allow) => [allow.authenticated()]),

		Norm: a
			.query()
			.arguments({
				conversationID: a.id(),
				messages: a.string().required(),
				formID: a.id().required(),
				currentFormState: a.string().required(),
			})
			.returns(
				a.customType({
					conversationID: a.id().required(),
					messages: a.string().required(),
					followUp: a.string(),
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
			})
			.authorization((allow) => [allow.authenticated()]),
	})
	// Add schema-level authorization to grant the norm function access to all models
	.authorization((allow) => [
		allow.resource(norm), 
		allow.resource(postAuthentication)
	]);

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
