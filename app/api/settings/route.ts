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
          $id: doc.$id,
          storeName: doc.storeName || 'متجر الواسطة',
          storePhone: doc.storePhone || '',
          whatsappNumber: doc.whatsappNumber || '',
          storeDescription: doc.storeDescription || '',
          defaultCurrency: doc.defaultCurrency || 'SAR',
          exchangeRate: Number(doc.exchangeRate) || 1,
          exchangeRateYer: Number(doc.exchangeRateYer) || 412,
          exchangeRateUsd: Number(doc.exchangeRateUsd) || 3.82,
          storeEmail: doc.storeEmail || '',
          storeAddress: doc.storeAddress || '',
          facebookUrl: doc.facebookUrl || '',
          instagramUrl: doc.instagramUrl || '',
          twitterUrl: doc.twitterUrl || '',
          tiktokUrl: doc.tiktokUrl || '',
          telegramUrl: doc.telegramUrl || '',
          shippingInfo: doc.shippingInfo || '',
          returnPolicyInfo: doc.returnPolicyInfo || '',
        },
      });
    }

    // افتراضيات في حال لم توجد بيانات بعد
    return NextResponse.json({
      success: true,
      settings: {
        storeName: 'متجر الواسطة',
        storePhone: '967772872245',
        whatsappNumber: '967771211394',
        storeEmail: 'support@alwasita.net',
        storeAddress: 'اليمن - حضرموت / صنعاء / عدن',
        storeDescription: 'وجهتك الأولى لأحدث الهواتف الذكية والإلكترونيات والملحقات الأصلية بأسعار منافسة وضمان حقيقي.',
        defaultCurrency: 'SAR',
        exchangeRate: 1,
        exchangeRateYer: 412,
        exchangeRateUsd: 3.82,
        facebookUrl: '',
        instagramUrl: '',
        twitterUrl: '',
        tiktokUrl: '',
        telegramUrl: '',
      },
    });
  } catch (error: any) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json(
      {
        success: true,
        settings: {
          storeName: 'متجر الواسطة',
          storePhone: '967772872245',
          whatsappNumber: '967771211394',
          storeEmail: 'support@alwasita.net',
          storeAddress: 'اليمن - حضرموت / صنعاء / عدن',
          defaultCurrency: 'SAR',
          exchangeRate: 1,
          exchangeRateYer: 412,
          exchangeRateUsd: 3.82,
        },
      },
      { status: 200 }
    );
  }
}
