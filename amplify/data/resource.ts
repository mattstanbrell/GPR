import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
    User: a.model({
        userID: a.id().required(), // Unique ID from Tenant Login
        email: a.string().required(), // Email from Tenant Login
        name: a.string().required(), // Users Name
        permissionGroup: a.enum(["ADMIN","MANAGER","SOCIAL_WORKER"]), // User role
        lastLogin: a.datetime(), // Timestamp of last login
    }).authorization(allow => [allow.publicApiKey()]),


    Form: a.model({
        caseNumber: a.string(),
        reason: a.string(),
        amount: a.float(),
        dateRequiredDay: a.integer(),
        dateRequiredMonth: a.integer(),
        dateRequiredYear: a.integer(),
        firstName: a.string(),
        lastName: a.string(),
        addressLineOne: a.string(),
        addressLineTwo: a.string(),
        addessTown: a.string(),
        addressPostcode: a.string(),
    }).authorization(allow => [allow.publicApiKey()])
});

export type schema = ClientSchema<typeof schema>

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: 'apiKey',
        apiKeyAuthorizationMode: {
            expiresInDays: 30,
        },
    },
});

/*
can interact with data models using the generated GraphQL API.
Example: Fetching Users
query ListUsers {
  listUsers {
    items {
      userId
      email
    }
  }
}


Creating a New User

mutation CreateForm {
  createForm(input: {
    userID: "unique-id",
    email: "user email",
    name: "users name",
    permissionGroup: "SOCIAL_WORKER"
  }) 
}

*/
