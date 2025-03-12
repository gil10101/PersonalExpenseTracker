import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/*== STEP 1 ===============================================================
The section below creates an Expense database table with name, amount, 
category, and date fields. The authorization rule allows both owner-based
and API key access for testing purposes.
=========================================================================*/
const schema = a.schema({
  Expense: a
    .model({
      name: a.string().required(),
      amount: a.float().required(),
      category: a.string().required(),
      date: a.datetime().required(),
    })
    .authorization((allow) => [
      allow.owner(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      // API key configuration is handled by Amplify
    }
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: expenses } = await client.models.Expense.list()

// return <ul>{expenses.map(expense => <li key={expense.id}>{expense.name}: ${expense.amount}</li>)}</ul>
