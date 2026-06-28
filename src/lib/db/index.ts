import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __dbClient: ReturnType<typeof postgres> | undefined;
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to your environment variables (.env.local or Vercel Project Settings)."
  );
}

// Reuse the connection across hot reloads / lambda invocations.
const client =
  global.__dbClient ??
  postgres(connectionString, { max: 1, prepare: false });

if (process.env.NODE_ENV !== "production") {
  global.__dbClient = client;
}

export const db = drizzle(client, { schema });
