// lib/appwrite/server.ts
import dns from 'dns';
import { Client, Databases, Storage } from "node-appwrite";

// حل مشكلة التوجيه و DNS للراوتر المحلي (Huawei Gateway) وإجبار Node على استخدام Google & Cloudflare DNS
if (typeof window === 'undefined') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch (e) {
    console.warn('Could not set custom DNS servers:', e);
  }
}

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const apiKey = process.env.APPWRITE_API_KEY!;

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

export const databases = new Databases(client);
export const storage = new Storage(client);