import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB || "banking_demo";

if (!uri) throw new Error("MONGODB_URI not set");

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getDb(): Promise<Db> {
  if (db) return db;
  client = await MongoClient.connect(uri);
  db = client.db(dbName);
  return db;
}
