import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'receipts',
  access: (allow) => ({
    'uploads/*': [
      allow.guest.to(['read', 'write', 'delete']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
  }),
});
