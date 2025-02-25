import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
    User: a.model({
        email: a.string().required(), 
        firstName: a.string().required(), 
        lastName: a.string().required(),
        permissionGroup: a.enum(["ADMIN","MANAGER","SOCIAL_WORKER"]), 
        lastLogin: a.datetime(), 
        forms: a.hasMany('Form', 'userID'),
        children: a.hasMany('Child','userID'),
        audits: a.hasMany('AuditLog','userID')
    }).authorization(allow => [
      allow.group('ADMIN'), 
      allow.owner()
    ]),


    Form: a.model({
        caseNumber: a.string(),
        reason: a.string(),
        amount: a.float(),
        dateRequiredDay: a.integer(),
        dateRequiredMonth: a.integer(),
        dateRequiredYear: a.integer(),
        addressLineOne: a.string(),
        addressLineTwo: a.string(),
        addessTown: a.string(),
        addressPostcode: a.string(),
        receipt: a.hasMany('Receipt','formID'),
        userID: a.id(),
        user: a.belongsTo('User', 'userID'),
        status: a.enum(['DRAFT','SUBMITTED','AUTHORISED','VALIDATED','COMPLETED']),
        child: a.hasOne('Child','formID')
    }).authorization(allow => [
      allow.publicApiKey().to(['read']), 
      allow.group('ADMIN'), 
      allow.owner() 
    ]),

    Todo: a.model({
      content: a.string(),
    }).authorization((allow) => [allow.owner()]),



    Child: a.model({
      firstName: a.string().required(),
      lastName: a.string().required(),
      dateOfBirth: a.date().required(),
      sex: a.string().required(),
      gender: a.string().required(),
      userID: a.id(),
      user: a.belongsTo('User', 'userID'),
      formID: a.id(),
      form: a.belongsTo('Form','formID')
    }).authorization((allow) => [
      allow.group('ADMIN'),
      allow.owner()
      ]),

    Receipt: a.model({
      formID: a.id(),
      form: a.belongsTo('Form', 'formID'),
      transactionDate: a.date(),
      merchantName: a.string(),
      paymentMethod: a.string(),
      subtotal: a.float(),
      itemDesc: a.string(),
    }).authorization((allow) => [
      allow.group('ADMIN'),
      allow.owner()
    ]),
    
    AuditLog: a.model({
      action: a.string().required(),
      date: a.date().required(),
      userID: a.id(),
      user: a.belongsTo('User','userID')
    }).authorization((allow) => [
      allow.owner().to(['read']),
      allow.group('ADMIN')
    ])
});

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: 'userPool',
        apiKeyAuthorizationMode: {
            expiresInDays: 30,
        },
    },
});

