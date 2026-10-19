import { NextResponse } from 'next/server';
import { databases } from '@/lib/appwrite/server';
import { ID, Query } from 'node-appwrite';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

// 1. جلب إعدادات المتجر
export async function GET() {
  try {
    const res = await databases.listDocuments(DATABASE_ID, 'settings', [Query.limit(1)]);
    const settings = res.documents.length > 0 ? res.documents[0] : null;
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب الإعدادات' },
      { status: 500 }
    );
  }
}

// 2. تحديث إعدادات المتجر
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      storeName,
      storePhone,
      whatsappNumber,
      storeDescription,
      defaultCurrency,
      exchangeRate,
      exchangeRateYer,
      exchangeRateUsd,
      storeEmail,
      storeAddress,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      tiktokUrl,
      telegramUrl,
      shippingInfo,
      returnPolicyInfo,
    } = body;

    const res = await databases.listDocuments(DATABASE_ID, 'settings', [Query.limit(1)]);

    const payload: any = {
      storeName: storeName || 'متجر الواسطة',
      storePhone: storePhone || '',
      whatsappNumber: whatsappNumber || '',
      storeDescription: storeDescription || '',
      defaultCurrency: defaultCurrency || 'SAR',
      exchangeRate: Number(exchangeRate) || 1,
      exchangeRateYer: Number(exchangeRateYer) || 412,
      exchangeRateUsd: Number(exchangeRateUsd) || 3.82,
      storeEmail: storeEmail !== undefined ? storeEmail : '',
      storeAddress: storeAddress !== undefined ? storeAddress : '',
      facebookUrl: facebookUrl !== undefined ? facebookUrl : '',
      instagramUrl: instagramUrl !== undefined ? instagramUrl : '',
      twitterUrl: twitterUrl !== undefined ? twitterUrl : '',
      tiktokUrl: tiktokUrl !== undefined ? tiktokUrl : '',
      telegramUrl: telegramUrl !== undefined ? telegramUrl : '',
      shippingInfo: shippingInfo !== undefined ? shippingInfo : '',
      returnPolicyInfo: returnPolicyInfo !== undefined ? returnPolicyInfo : '',
    };

    let updatedDoc;
    if (res.documents.length > 0) {
      updatedDoc = await databases.updateDocument(
        DATABASE_ID,
        'settings',
        res.documents[0].$id,
        payload
      );
    } else {
      updatedDoc = await databases.createDocument(
        DATABASE_ID,
        'settings',
        ID.unique(),
        payload
      );
    }

    return NextResponse.json({ success: true, settings: updatedDoc });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حفظ الإعدادات' },
      { status: 500 }
    );
  }
}
