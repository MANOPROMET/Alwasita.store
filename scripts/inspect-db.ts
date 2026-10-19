import { Client, Databases } from "node-appwrite";
import fs from "fs";
import path from "path";

// Read .env.local natively without external dependencies
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...vals] = trimmed.split("=");
      if (key && vals.length > 0) {
        process.env[key.trim()] = vals.join("=").trim();
      }
    }
  });
}

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "al_wasita_store";

console.log("Connecting to Appwrite...");
console.log("Endpoint:", endpoint);
console.log("Project ID:", projectId);
console.log("Database ID:", databaseId);

if (!projectId || !apiKey) {
  console.error("Missing Appwrite project ID or API key in .env.local");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function inspect() {
  try {
    const collections = await databases.listCollections(databaseId);
    console.log(`Found ${collections.total} collections in database '${databaseId}':`);
    
    for (const col of collections.collections) {
      console.log(`\n--- Collection: ${col.name} (ID: ${col.$id}) ---`);
      console.log("Attributes:");
      col.attributes.forEach((attr: any) => {
        console.log(`  - ${attr.key} (${attr.type}, required: ${attr.required})`);
      });
      
      const docs = await databases.listDocuments(databaseId, col.$id);
      console.log(`Total Documents: ${docs.total}`);
    }
  } catch (error: any) {
    console.error("Appwrite connection error:", error.message || error);
  }
}

inspect();
