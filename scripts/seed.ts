// scripts/seed.ts
import { Client, Databases, ID, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

async function seedSettings() {
    console.log('⚙️ فحص وتجهيز إعدادات المتجر...');

    try {
        const existing = await databases.listDocuments(DATABASE_ID, 'settings', [
            Query.limit(1),
        ]);

        if (existing.documents.length === 0) {
            console.log('📝 إنشاء إعدادات المتجر الأساسية...');
            await databases.createDocument(DATABASE_ID, 'settings', ID.unique(), {
                storeName: 'متجر الواسطة',
                storePhone: '967772872245',
                whatsappNumber: '967771211394',
                storeDescription: 'وجهتك الأولى لأحدث الهواتف الذكية والإلكترونيات والملحقات الأصلية.',
                defaultCurrency: 'YER', // أو القيمة المعتمدة في enum العملة لديك
                exchangeRate: 1,
            });
            console.log('✅ تم حفظ إعدادات المتجر بنجاح!');
        } else {
            console.log('ℹ️ إعدادات المتجر موجودة مسبقاً.');
        }
    } catch (error) {
        console.error('❌ خطأ أثناء إدخال الإعدادات:', error);
    }
}

seedSettings();