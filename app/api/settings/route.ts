import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/server';
import { Query } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

export async function GET() {
  try {
    const res = await databases.listDocuments(DATABASE_ID, 'settings', [Query.limit(1)]);
    if (res.documents.length > 0) {
      const doc = res.documents[0] as any;
      return NextResponse.json({
        success: true,
        settings: {
          storeName: doc.storeName || 'متجر الواسطة',
          storePhone: doc.storePhone || '',
          whatsappNumber: doc.whatsappNumber || '',
          storeDescription: doc.storeDescription || '',
          defaultCurrency: doc.defaultCurrency || 'SAR',
          exchangeRateYer: Number(doc.exchangeRateYer) || 412,
          exchangeRateUsd: Number(doc.exchangeRateUsd) || 3.82,
        },
      });
    }

    // افتراضيات في حال لم توجد بيانات
    return NextResponse.json({
      success: true,
      settings: {
        storeName: 'متجر الواسطة',
        storePhone: '967772872245',
        whatsappNumber: '967771211394',
        storeDescription: '',
        defaultCurrency: 'SAR',
        exchangeRateYer: 412,
        exchangeRateUsd: 3.82,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json(
      {
        success: true,
        settings: {
          storeName: 'متجر الواسطة',
          defaultCurrency: 'SAR',
          exchangeRateYer: 412,
          exchangeRateUsd: 3.82,
        },
      },
      { status: 200 }
    );
  }
}
