import { NextResponse } from 'next/server';
import { databases, storage } from '@/lib/appwrite/server';
import { ID, Query } from 'node-appwrite';
import { InputFile } from 'node-appwrite/file';
import { getProducts } from '@/lib/appwrite/api';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'products';

// 0. جلب كافة المنتجات للأدمن مع أسعارها وصورها
export async function GET() {
  try {
    const products = await getProducts({ includeInactive: true });
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error('API Error fetching products:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    );
  }
}

// 1. إضافة منتج جديد
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = (formData.get('name') as string) || '';
    const description = (formData.get('description') as string) || '';
    const categoryId = (formData.get('categoryId') as string) || '';
    const isActive = formData.get('isActive') === 'true';
    const isFeatured = formData.get('isFeatured') === 'true';
    const isOffer = formData.get('isOffer') === 'true';
    const compareAtPriceRaw = formData.get('compareAtPrice') as string;
    const compareAtPrice = compareAtPriceRaw ? parseFloat(compareAtPriceRaw) : undefined;

    const condition = (formData.get('condition') as string) || 'new';
    const conditionLabel = (formData.get('conditionLabel') as string) || (condition === 'used' ? 'مستخدم' : 'جديد');

    const variantsRaw = (formData.get('variants') as string) || '[]';
    const colorsRaw = (formData.get('colors') as string) || '[]';
    const imageColorsRaw = (formData.get('imageColors') as string) || '[]';
    const keySpecsRaw = (formData.get('keySpecs') as string) || '[]';

    const variants = JSON.parse(variantsRaw);
    const colors: string[] = JSON.parse(colorsRaw);
    const imageColors: string[] = JSON.parse(imageColorsRaw);

    if (!name.trim()) {
      return NextResponse.json({ error: 'اسم المنتج مطلوب' }, { status: 400 });
    }

    const productId = ID.unique();
    const generatedSlug =
      name
        .trim()
        .toLowerCase()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w\u0600-\u06FF-]/g, '') || `product-${productId}`;

    // 1. رفع الصور عبر Server SDK
    const files = formData.getAll('images') as File[];
    const uploadedFileIds: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const inputFile = InputFile.fromBuffer(buffer, file.name || `image-${i}.jpg`);
        const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);
        uploadedFileIds.push(uploadedFile.$id);
      }
    }

    // 2. إنشاء مستند المنتج الأساسي
    const productPayload: any = {
      name: name.trim(),
      slug: generatedSlug,
      description: description.trim(),
      keySpecs: keySpecsRaw,
      isActive: Boolean(isActive),
      isFeatured: Boolean(isFeatured),
      isOffer: Boolean(isOffer),
      condition: condition === 'used' ? 'used' : 'new',
      conditionLabel: conditionLabel.trim() || (condition === 'used' ? 'مستخدم' : 'جديد'),
      hidePrice: false,
      sortOrder: 0,
      viewsCount: 0,
    };

    if (compareAtPrice && compareAtPrice > 0) {
      productPayload.compareAtPrice = compareAtPrice;
    }

    if (categoryId) {
      productPayload.categories = categoryId;
    }

    await databases.createDocument(DATABASE_ID, 'products', productId, productPayload);

    // 3. إنشاء الألوان وحفظ خريطة بالـ IDs الخاصة بها
    const colorNameToDocId: Record<string, string> = {};
    for (let i = 0; i < colors.length; i++) {
      const cName = colors[i].trim();
      if (cName) {
        const colorDoc = await databases.createDocument(DATABASE_ID, 'product_colors', ID.unique(), {
          products: productId,
          name: cName,
          isAvailable: true,
          sortOrder: i,
        });
        colorNameToDocId[cName] = colorDoc.$id;
      }
    }

    // 4. إنشاء النسخ
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (v.price) {
        const memVal = (v.storage || '').trim();
        const ramVal = (v.ram || '').trim();
        let varName = '';
        if (memVal && ramVal) {
          varName = `${memVal} / ${ramVal}`;
        } else if (memVal) {
          varName = memVal;
        } else if (ramVal) {
          varName = ramVal;
        } else {
          const cleanName = (v.name || '').replace(/[\s\/]/g, '').trim();
          varName = cleanName && cleanName !== 'افتراضي' ? v.name.trim() : 'نسخة أساسية';
        }

        await databases.createDocument(DATABASE_ID, 'product_variants', ID.unique(), {
          products: productId,
          name: varName,
          memory: memVal,
          ram: ramVal,
          price: parseFloat(v.price) || 0,
          isAvailable: true,
          sortOrder: i,
        });
      }
    }

    // 5. إنشاء سجلات الصور مع ربط كل صورة بلونها إن وجد
    for (let i = 0; i < uploadedFileIds.length; i++) {
      const assocColorName = imageColors[i];
      const assocColorDocId = assocColorName ? colorNameToDocId[assocColorName] : undefined;

      const imgPayload: any = {
        products: productId,
        fileId: uploadedFileIds[i],
        sortOrder: i,
      };
      if (assocColorDocId) {
        imgPayload.color = assocColorDocId;
      }

      await databases.createDocument(DATABASE_ID, 'product_images', ID.unique(), imgPayload);
    }

    return NextResponse.json({ success: true, productId });
  } catch (error: any) {
    console.error('API Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حفظ المنتج' },
      { status: 500 }
    );
  }
}

// 2. تعديل منتج قائم
export async function PUT(request: Request) {
  try {
    const formData = await request.formData();
    const productId = formData.get('id') as string;

    if (!productId) {
      return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });
    }

    const name = (formData.get('name') as string) || '';
    const description = (formData.get('description') as string) || '';
    const categoryId = (formData.get('categoryId') as string) || '';
    const isActive = formData.get('isActive') === 'true';
    const isFeatured = formData.has('isFeatured') ? formData.get('isFeatured') === 'true' : undefined;
    const isOffer = formData.has('isOffer') ? formData.get('isOffer') === 'true' : undefined;
    const compareAtPriceRaw = formData.get('compareAtPrice') as string;
    const compareAtPrice = compareAtPriceRaw ? parseFloat(compareAtPriceRaw) : undefined;

    const condition = formData.get('condition') as string;
    const conditionLabel = formData.get('conditionLabel') as string;

    const variantsRaw = (formData.get('variants') as string) || '[]';
    const colorsRaw = (formData.get('colors') as string) || '[]';
    const imageColorsRaw = (formData.get('imageColors') as string) || '[]';

    const variants = JSON.parse(variantsRaw);
    const colors: string[] = JSON.parse(colorsRaw);
    const imageColors: string[] = JSON.parse(imageColorsRaw);
    const keySpecsRaw = formData.get('keySpecs') as string;

    if (!name.trim()) {
      return NextResponse.json({ error: 'اسم المنتج مطلوب' }, { status: 400 });
    }

    // 1. تحديث مستند المنتج الأساسي
    const productPayload: any = {
      name: name.trim(),
      description: description.trim(),
      isActive: Boolean(isActive),
    };

    if (keySpecsRaw !== undefined && keySpecsRaw !== null) {
      productPayload.keySpecs = keySpecsRaw;
    }

    if (condition) productPayload.condition = condition === 'used' ? 'used' : 'new';
    if (conditionLabel !== undefined && conditionLabel !== null) {
      productPayload.conditionLabel = conditionLabel.trim() || (productPayload.condition === 'used' ? 'مستخدم' : 'جديد');
    }

    if (isFeatured !== undefined) productPayload.isFeatured = Boolean(isFeatured);
    if (isOffer !== undefined) productPayload.isOffer = Boolean(isOffer);
    if (compareAtPrice !== undefined) {
      productPayload.compareAtPrice = compareAtPrice;
    }

    if (categoryId) {
      productPayload.categories = categoryId;
    }

    await databases.updateDocument(DATABASE_ID, 'products', productId, productPayload);

    // 2. تحديث النسخ (حذف القديمة وإعادة إضافة الجديدة إذا تم إرسالها)
    if (variants && variants.length > 0) {
      const existingVars = await databases.listDocuments(DATABASE_ID, 'product_variants', [
        Query.equal('products', productId),
      ]);
      await Promise.all(
        existingVars.documents.map((v) =>
          databases.deleteDocument(DATABASE_ID, 'product_variants', v.$id)
        )
      );

      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (v.price) {
          const memVal = (v.storage || '').trim();
          const ramVal = (v.ram || '').trim();
          let varName = '';
          if (memVal && ramVal) {
            varName = `${memVal} / ${ramVal}`;
          } else if (memVal) {
            varName = memVal;
          } else if (ramVal) {
            varName = ramVal;
          } else {
            const cleanName = (v.name || '').replace(/[\s\/]/g, '').trim();
            varName = cleanName && cleanName !== 'افتراضي' ? v.name.trim() : 'نسخة أساسية';
          }

          await databases.createDocument(DATABASE_ID, 'product_variants', ID.unique(), {
            products: productId,
            name: varName,
            memory: memVal,
            ram: ramVal,
            price: parseFloat(v.price) || 0,
            isAvailable: true,
            sortOrder: i,
          });
        }
      }
    }

    // 3. تحديث الألوان
    const colorNameToDocId: Record<string, string> = {};
    if (colors && colors.length > 0) {
      const existingColors = await databases.listDocuments(DATABASE_ID, 'product_colors', [
        Query.equal('products', productId),
      ]);
      await Promise.all(
        existingColors.documents.map((c) =>
          databases.deleteDocument(DATABASE_ID, 'product_colors', c.$id)
        )
      );

      for (let i = 0; i < colors.length; i++) {
        const cName = colors[i].trim();
        if (cName) {
          const colorDoc = await databases.createDocument(
            DATABASE_ID,
            'product_colors',
            ID.unique(),
            {
              products: productId,
              name: cName,
              isAvailable: true,
              sortOrder: i,
            }
          );
          colorNameToDocId[cName] = colorDoc.$id;
        }
      }
    }

    // 4. رفع أي صور جديدة مرفقة
    const files = formData.getAll('images') as File[];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const inputFile = InputFile.fromBuffer(buffer, file.name || `image-${i}.jpg`);
        const uploadedFile = await storage.createFile(BUCKET_ID, ID.unique(), inputFile);

        const assocColorName = imageColors[i];
        const assocColorDocId = assocColorName ? colorNameToDocId[assocColorName] : undefined;

        const imgPayload: any = {
          products: productId,
          fileId: uploadedFile.$id,
          sortOrder: 10 + i,
        };
        if (assocColorDocId) {
          imgPayload.color = assocColorDocId;
        }

        await databases.createDocument(DATABASE_ID, 'product_images', ID.unique(), imgPayload);
      }
    }

    return NextResponse.json({ success: true, productId });
  } catch (error: any) {
    console.error('API Error updating product:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تعديل المنتج' },
      { status: 500 }
    );
  }
}

// 3. تبديل سريع لحالة منتج (الأكثر طلباً، العروض، النشاط)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isFeatured, isOffer, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });
    }

    const payload: any = {};
    if (isFeatured !== undefined) payload.isFeatured = Boolean(isFeatured);
    if (isOffer !== undefined) payload.isOffer = Boolean(isOffer);
    if (isActive !== undefined) payload.isActive = Boolean(isActive);

    const updated = await databases.updateDocument(DATABASE_ID, 'products', id, payload);
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('API Error patching product:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء تحديث حالة المنتج' },
      { status: 500 }
    );
  }
}

// 4. حذف المنتج مع متعلقاته
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });
    }

    // أ) حذف النسخ المرتبطة
    const vars = await databases.listDocuments(DATABASE_ID, 'product_variants', [
      Query.equal('products', productId),
    ]);
    await Promise.all(
      vars.documents.map((v) => databases.deleteDocument(DATABASE_ID, 'product_variants', v.$id))
    );

    // ب) حذف الألوان المرتبطة
    const cols = await databases.listDocuments(DATABASE_ID, 'product_colors', [
      Query.equal('products', productId),
    ]);
    await Promise.all(
      cols.documents.map((c) => databases.deleteDocument(DATABASE_ID, 'product_colors', c.$id))
    );

    // ج) حذف الصور المرتبطة
    const imgs = await databases.listDocuments(DATABASE_ID, 'product_images', [
      Query.equal('products', productId),
    ]);
    await Promise.all(
      imgs.documents.map((img) => databases.deleteDocument(DATABASE_ID, 'product_images', img.$id))
    );

    // د) حذف مستند المنتج نفسه
    await databases.deleteDocument(DATABASE_ID, 'products', productId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error deleting product:', error);
    return NextResponse.json(
      { error: error.message || 'حدث خطأ أثناء حذف المنتج' },
      { status: 500 }
    );
  }
}
