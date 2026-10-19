const { Client, Databases } = require("node-appwrite");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, "../.env.local");
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

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function inspectProductsSchema() {
  const targetCols = ['products', 'product_variants', 'product_colors', 'product_images', 'categories'];
  for (const id of targetCols) {
    try {
      const col = await databases.getCollection(databaseId, id);
      console.log(`\n=== Collection: ${col.name} (${col.$id}) ===`);
      col.attributes.forEach((a) => {
        console.log(`- ${a.key} | type: ${a.type} | required: ${a.required} | relatedCollection: ${a.relatedCollection || ''}`);
      });
    } catch (e) {
      console.error(`Error fetching col ${id}:`, e.message);
    }
  }
}

inspectProductsSchema();
