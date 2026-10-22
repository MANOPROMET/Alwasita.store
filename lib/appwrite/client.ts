import { Client, Account, Databases, Storage } from "appwrite";

export const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6a79cc3c0029e33756c8');
    
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client); // أضفنا هذا السطر للتعامل مع رفع الصور