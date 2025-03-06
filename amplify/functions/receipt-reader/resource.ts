import { defineFunction, secret } from '@aws-amplify/backend';

export const receiptReader = defineFunction({
  name: 'receipt-reader',
  entry: './handler.ts',
  environment: {
    OPENAI_API_KEY: secret("OPENAI_API_KEY"),
  }
});