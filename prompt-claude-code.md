
Pull your latest environment variables

Run vercel env pull .env.development.local to make the latest environment variables available to your project locally.

3

Install libSQL client

Run the following command to install the Turso libSQL SDK:


npm install @libsql/client
You can find more details and documentation on the Turso Quickstart for TypeScript.

4

Initialize libSQL client

To start using the Turso libSQL client in your project, import the client and use it in your pages or route handlers:


import { createClient } from '@libsql/client';
import { NextResponse } from 'next/server';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

export const POST = async () => {
  // Fetch data from SQLite
  const result = await client.execute("CREATE TABLE todos (description);");
};