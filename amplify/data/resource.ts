import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
    User: a.model({
        userID: a.id().required(), // Unique ID from Tenant Login
        email: a.string().required(), // Email from Tenant Login
        firstName: a.string().required(), // Users Name
        lastName: a.string().required(),
        permissionGroup: a.enum(["ADMIN","MANAGER","SOCIAL_WORKER"]), // User role (SUBJECT TO CHANGE)
        lastLogin: a.datetime(), // Timestamp of last login
    }).authorization(allow => [allow.owner()]),


    Form: a.model({
        formID: a.id().required(),
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
        receipt: a.hasOne('Receipt','formID')
    }).authorization(allow => [allow.owner()]),

    Todo: a.model({
      content: a.string(),
    }).authorization((allow) => [allow.owner()]),


    // Child model from the Persons table in the SQL Schema
    Child: a.model({
      childId: a.id().required(),
      firstName: a.string().required(),
      lastName: a.string().required(),
      dateOfBirth: a.date().required(),
      sex: a.string().required(),
      gender: a.string().required()
    }).authorization((allow) => [allow.owner()]),

    Receipt: a.model({
      recepitID: a.id().required(),
      formID: a.id(),
      form: a.belongsTo('Form', 'formID'),
      transactionDate: a.date(),
      merchantName: a.string(),
      paymentMethod: a.string(),
      subtotal: a.float(),
      itemDesc: a.string(),
      whoPurchased: a.belongsTo('User', 'userID')
    }).authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: 'apiKey',
        apiKeyAuthorizationMode: {
            expiresInDays: 30,
        },
    },
});
