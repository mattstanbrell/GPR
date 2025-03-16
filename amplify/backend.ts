import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { receiptReader } from './functions/receipt-reader/resource'
import { storage } from './storage/resource'

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
	auth,
	data,
	receiptReader,
	storage
});
