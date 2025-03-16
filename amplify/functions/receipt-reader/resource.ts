import { defineFunction, secret } from '@aws-amplify/backend';

export const receiptReader = defineFunction({
  name: 'receipt-reader',
  entry: './handler.ts',
  timeoutSeconds: 300, 
  environment: {
    OPENAI_API_KEY: secret("OPENAI_API_KEY"),
  }
});