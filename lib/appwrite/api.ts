// lib/appwrite/api.ts
import { databases } from './server';
import { Query } from 'node-appwrite';
import { Banner, Category, Product, Variant, Color, ProductImage, StoreSettings, BlogPost } from '@/types';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'al_wasita_store';

function toPlainObject<T>(data: T): T {
    if (data === undefined || data === null) {
        return [] as unknown as T;
    }
    return JSON.parse(JSON.stringify(data));
}

// دالة مساعدة لتجهيز رابط الصورة من Appwrite Storage أو رابط خارجي
import { getProductImageUrl } from './utils';
export { getProductImageUrl };

// دالة لجلب الصور والألوان والنسخ لكل منتج
async function enrichProducts(products: Product[]): Promise<Product[]> {
    if (!Array.isArray(products) || products.length === 0) {
        return [];
    }

    const enriched = await Promise.all(
        products.map(async (product) => {
            try {
                const [variantsRes, imagesRes, colorsRes] = await Promise.all([
                    databases.listDocuments(DATABASE_ID, 'product_variants', [
                        Query.equal('products', product.$id),
                        Query.orderAsc('price')
                    ]),
                    databases.listDocuments(DATABASE_ID, 'product_images', [
                        Query.equal('products', product.$id),
                        Query.orderAsc('sortOrder')
                    ]),
                    databases.listDocuments(DATABASE_ID, 'product_colors', [
                        Query.equal('products', product.$id),
                        Query.orderAsc('sortOrder')
                    ]),
                ]);

                const variants = (variantsRes?.documents || []) as unknown as Variant[];
                const images = (imagesRes?.documents || []) as unknown as ProductImage[];
                const colors = (colorsRes?.documents || []) as unknown as Color[];

                const mainImage = images.length > 0 ? getProductImageUrl(images[0].fileId) : '/window.svg';
                const condition = (product as any).condition || 'new';
                const conditionLabel = (product as any).conditionLabel || (condition === 'used' ? 'مستخدم' : 'جديد');

                // معالجة المواصفات الأساسية المخصصة
                let keySpecs: any[] = [];
                const rawKeySpecs = (product as any).keySpecs;
                if (rawKeySpecs) {
                    try {
                        const parsed = typeof rawKeySpecs === 'string' ? JSON.parse(rawKeySpecs) : rawKeySpecs;
                        if (Array.isArray(parsed)) {
                            keySpecs = parsed.filter((item: any) => item && typeof item === 'object' && item.label?.trim() && item.value?.trim());
                        }
                    } catch {
                        keySpecs = [];
                    }
                }

                return {
                    ...product,
                    condition,
                    conditionLabel,
                    keySpecs,
                    variants,
                    colors,
                    images,
                    price: variants.length > 0 ? variants[0].price : 0,
                    mainImageFileId: mainImage,
                };
            } catch (err) {
                console.error(`Error enriching product ${product?.$id}:`, err);
                return { ...product, keySpecs: [], variants: [], colors: [], images: [], price: 0, mainImageFileId: '/window.svg' };
            }
        })
    );

    return toPlainObject(enriched);
}

// 1. جلب البنرات (سلايدر رئيسي أو البنر الثابت)
export async function getBanners(type?: 'hero' | 'promo'): Promise<Banner[]> {
    try {
        const queries = [Query.equal('isActive', true), Query.orderAsc('sortOrder')];
        if (type) {
            queries.push(Query.equal('bannerType', type));
        }
        const response = await databases.listDocuments(DATABASE_ID, 'banners', queries);
        const banners = toPlainObject((response?.documents || []) as unknown as Banner[]);

        // في حال كان المطلوب سلايدر ولم نجد بنرات محددة كـ hero تحديداً، نعيد البنرات التي ليست promo
        if (type === 'hero') {
            return banners.filter((b) => b.bannerType !== 'promo');
        }

        return banners;
    } catch (error) {
        console.error('Error fetching banners:', error);
        return [];
    }
}

// دالة جلب البنر الثابت الترويجي
export async function getPromoBanner(): Promise<Banner | null> {
    try {
        const response = await databases.listDocuments(DATABASE_ID, 'banners', [
            Query.equal('isActive', true),
            Query.equal('bannerType', 'promo'),
            Query.orderAsc('sortOrder'),
            Query.limit(1),
        ]);
        if (response?.documents && response.documents.length > 0) {
            return toPlainObject(response.documents[0] as unknown as Banner);
        }
        return null;
    } catch (error) {
        console.error('Error fetching promo banner:', error);
        return null;
    }
}

// 2. جلب التصنيفات
export async function getCategories(): Promise<Category[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            'categories',
            [Query.equal('isActive', true), Query.orderAsc('sortOrder')]
        );
        return toPlainObject((response?.documents || []) as unknown as Category[]);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// 3. جلب المنتجات المميزة (الأكثر طلباً) المحددة من الإدارة
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
    try {
        // البحث عن المنتجات المميزة المحددة صراحة كـ isFeatured
        const featuredRes = await databases.listDocuments(
            DATABASE_ID,
            'products',
            [Query.equal('isActive', true), Query.equal('isFeatured', true), Query.limit(limit)]
        );

        const products = (featuredRes?.documents || []) as unknown as Product[];
        return await enrichProducts(products);
    } catch (error) {
        console.error('Error fetching featured products:', error);
        return [];
    }
}


// 4. جلب جميع المنتجات مع فلترة
// تحديث دالة getProducts في lib/appwrite/api.ts
export async function getProducts(options?: {
  categoryId?: string;
  searchQuery?: string;
  sortBy?: 'newest' | 'price_asc' | 'price_desc';
  includeInactive?: boolean;
}): Promise<Product[]> {
  try {
    const queries = [Query.orderDesc('$createdAt')];
    if (!options?.includeInactive) {
      queries.push(Query.equal('isActive', true));
    }

    // جلب المنتجات
    const response = await databases.listDocuments(DATABASE_ID, 'products', queries);
    let products = (response?.documents || []) as unknown as Product[];

    // فلترة القسم محلياً بالتطابق مع ID القسم أو الـ Slug
    if (options?.categoryId && options.categoryId.trim() !== '') {
      const targetParam = options.categoryId.trim();
      const allCategories = await getCategories();
      const matchedCat = allCategories.find(
        (c) => c.$id === targetParam || c.slug === targetParam
      );
      const targetId = matchedCat ? matchedCat.$id : targetParam;
      const targetSlug = matchedCat ? matchedCat.slug : targetParam;

      products = products.filter((p: any) => {
        const catField = p.categories || p.category;
        if (!catField) return false;

        const catList = Array.isArray(catField) ? catField : [catField];
        return catList.some((c: any) => {
          if (!c) return false;
          if (typeof c === 'string') {
            return c === targetId || c === targetSlug || c === targetParam;
          }
          if (typeof c === 'object') {
            return c.$id === targetId || c.slug === targetSlug || c.$id === targetParam || c.slug === targetParam;
          }
          return false;
        });
      });
    }

    // فلترة البحث بالنص محلياً لضمان عدم الحاجة لـ Index معقد في Appwrite
    if (options?.searchQuery && options.searchQuery.trim() !== '') {
      const queryText = options.searchQuery.trim().toLowerCase();
      products = products.filter((p) => p.name && p.name.toLowerCase().includes(queryText));
    }

    // إثراء المنتجات بالأسعار والصور من variants
    const enrichedProducts = await enrichProducts(products);

    // ترتيب المنتجات حسب السعر أو التاريخ بعد حساب السعر الحقيقي من النسخ (variants)
    if (options?.sortBy === 'price_asc') {
      enrichedProducts.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (options?.sortBy === 'price_desc') {
      enrichedProducts.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else {
      // الأحدث افتراضياً
      enrichedProducts.sort((a, b) => {
        const timeA = a.$createdAt ? new Date(a.$createdAt).getTime() : 0;
        const timeB = b.$createdAt ? new Date(b.$createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }

    return enrichedProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// 5. جلب منتج مفرد مع كل تفاصيله
export async function getProductById(id: string): Promise<Product | null> {
    try {
        const productDoc = await databases.getDocument(DATABASE_ID, 'products', id);
        const enriched = await enrichProducts([productDoc as unknown as Product]);
        return enriched.length > 0 ? enriched[0] : null;
    } catch (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
    }
}
export type { StoreSettings };

// دالة جلب إعدادات المتجر
export async function getStoreSettings(): Promise<StoreSettings> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            'settings',
            [Query.limit(1)]
        );

        if (response?.documents && response.documents.length > 0) {
            return toPlainObject(response.documents[0] as unknown as StoreSettings);
        }
    } catch (error) {
        console.warn('Error fetching store settings, using defaults:', error);
    }

    return {
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
    };
}
// أضف هذه الدالة في lib/appwrite/api.ts
export async function getLatestProducts(limit = 8): Promise<Product[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'products',
      [
        Query.equal('isActive', true),
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ]
    );
    return await enrichProducts((response?.documents || []) as unknown as Product[]);
  } catch (error) {
    console.error('Error fetching latest products:', error);
    return [];
  }
}
// أضف هذه الواجهة والدالة في lib/appwrite/api.ts

export interface NavigationItem {
  $id: string;
  title: string;
  linkType: string;
  linkValue?: string;
  sortOrder: number;
  isActive: boolean;
}

export async function getNavigationLinks(): Promise<NavigationItem[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'navigation',
      [
        Query.equal('isActive', true),
        Query.orderAsc('sortOrder')
      ]
    );
    return toPlainObject((response?.documents || []) as unknown as NavigationItem[]);
  } catch (error) {
    console.error('Error fetching navigation links:', error);
    return [];
  }
}
// دالة جلب منتجات العروض والتخفيضات (المرتبطة بصفحة العروض والتبويب الرئيسي)
export async function getDiscountedProducts(): Promise<Product[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'products',
      [
        Query.equal('isActive', true),
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ]
    );

    const enriched = await enrichProducts((response?.documents || []) as unknown as Product[]);
    // تصفية المنتجات التي وضعها الأدمن في العروض (isOffer == true) أو التي لها سعر مقارنة أكبر من السعر الفعلي
    return enriched.filter(
      (product: any) =>
        Boolean(product.isOffer) ||
        (product.compareAtPrice && product.compareAtPrice > product.price)
    );
  } catch (error) {
    console.error('Error fetching discounted products:', error);
    return [];
  }
}


// أضف هذه الواجهة والدالة في lib/appwrite/api.ts

export interface PageDocument {
  $id: string;
  title: string;
  slug: string;
  content: string;
  isActive: boolean;
  sortOrder: number;
}

export async function getPageBySlug(slug: string): Promise<PageDocument | null> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'pages',
      [
        Query.equal('slug', slug),
        Query.equal('isActive', true),
        Query.limit(1)
      ]
    );

    if (response.documents.length > 0) {
      return toPlainObject(response.documents[0] as unknown as PageDocument);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching page ${slug}:`, error);
    return null;
  }
}

//cheack for remove
export async function deleteProduct(productId: string) {
  try {
    return await databases.deleteDocument(DATABASE_ID, 'products', productId);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

// 10. جلب مقالات المدونة
export async function getBlogPosts(options?: {
  category?: string;
  limit?: number;
  includeInactive?: boolean;
}): Promise<BlogPost[]> {
  try {
    const queries = [Query.orderDesc('$createdAt')];
    if (!options?.includeInactive) {
      queries.push(Query.equal('isActive', true));
    }
    if (options?.category && options.category !== 'all') {
      queries.push(Query.equal('category', options.category));
    }
    if (options?.limit) {
      queries.push(Query.limit(options.limit));
    }
    const response = await databases.listDocuments(DATABASE_ID, 'blog_posts', queries);
    return toPlainObject((response.documents || []) as unknown as BlogPost[]);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export async function getBlogPostBySlug(slugOrId: string): Promise<BlogPost | null> {
  try {
    let decoded = slugOrId;
    try {
      decoded = decodeURIComponent(slugOrId);
    } catch {}

    // 1. بحث بالـ slug المفكوك (Decoded)
    let response = await databases.listDocuments(DATABASE_ID, 'blog_posts', [
      Query.equal('slug', decoded),
      Query.limit(1),
    ]);

    // 2. إذا لم يجد، نجرب الـ slug الخام إن كان مختلفاً
    if (response.documents.length === 0 && decoded !== slugOrId) {
      response = await databases.listDocuments(DATABASE_ID, 'blog_posts', [
        Query.equal('slug', slugOrId),
        Query.limit(1),
      ]);
    }

    // 3. إذا لم يجد بالـ slug، نجرب البحث بالـ Document ID
    if (response.documents.length === 0) {
      try {
        const doc = await databases.getDocument(DATABASE_ID, 'blog_posts', slugOrId);
        return toPlainObject(doc as unknown as BlogPost);
      } catch {
        try {
          const doc = await databases.getDocument(DATABASE_ID, 'blog_posts', decoded);
          return toPlainObject(doc as unknown as BlogPost);
        } catch {
          return null;
        }
      }
    }
    return toPlainObject(response.documents[0] as unknown as BlogPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}