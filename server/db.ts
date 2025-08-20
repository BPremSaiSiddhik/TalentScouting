import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import dotenv from "dotenv";
import * as schema from "@shared/schema";

// Load environment variables from .env file
dotenv.config();

// Ensure WebSocket support for NeonDB
neonConfig.webSocketConstructor = ws; 

// Debugging: Log to check if DATABASE_URL is loaded
console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ Not Set");

// Throw error if DATABASE_URL is not found
if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL must be set in .env");
}

// Create NeonDB connection pool
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Initialize Drizzle ORM
export const db = drizzle(pool, { schema });

console.log("✅ Connected to NeonDB Successfully!");
