import { defineFunction } from '@aws-amplify/backend';

export const postLogin = defineFunction({
  name: 'post-login',
  entry: "./handler.ts"
});