// types/index.ts

export interface Banner {
    $id: string;
    title: string;
    subtitle?: string;
    bannerType?: 'hero' | 'promo';
    productId?: string;
    imageFileId: string;
    linkType?: string;
    linkValue?: string;
    sortOrder?: number;
    isActive: boolean;
    description?: string;
    linkUrl?: string;
    startsAt?: string;
    endsAt?: string;
}

export interface Category {
    $id: string;
    name: string;
    slug: string;
    imageFileId?: string;
    isActive: boolean;
    sortOrder?: number;
}

export interface Brand {
    $id: string;
    name: string;
    slug: string;
    logoFileId?: string;
    isActive: boolean;
}

export interface Color {
    $id: string;
    name: string;
    hexCode?: string;
    sortOrder?: number;
    isAvailable: boolean;
}

export interface Variant {
    $id: string;
    name: string;
    memory?: string;
    ram?: string;
    price: number;
    isAvailable: boolean;
}

export interface ProductImage {
    $id: string;
    fileId: string;
    alt?: string;
    sortOrder?: number;
    color?: Color | string;
}

export interface KeySpec {
    label: string;
    value: string;
}

export interface Product {
    $id: string;
    name: string;
    slug?: string;
    description?: string;
    price: number;
    compareAtPrice?: number; // السعر قبل الخصم إن وجد
    isOffer?: boolean; // منتج مميز في العروض
    mainImageFileId?: string;
    isActive: boolean;
    isFeatured?: boolean;
    stock?: number;
    category?: Category | string;
    brand?: Brand | string;
    condition?: 'new' | 'used';
    conditionLabel?: string;
    colors?: Color[];
    variants?: Variant[];
    images?: ProductImage[];
    keySpecs?: string | KeySpec[]; // المواصفات الأساسية المخصصة
    $createdAt?: string;
    $updatedAt?: string;
}

export interface StoreSettings {
    $id?: string;
    storeName: string;
    storePhone?: string;
    storeDescription?: string;
    storeLogoFileId?: string;
    whatsappNumber?: string;
    defaultCurrency: string;
    exchangeRate: number;
    exchangeRateYer?: number;
    exchangeRateUsd?: number;
    storeEmail?: string;
    storeAddress?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    tiktokUrl?: string;
    telegramUrl?: string;
    shippingInfo?: string;
    returnPolicyInfo?: string;
}



export interface CartItem {
    id: string;
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    variantId?: string;
    variantName?: string;
    colorId?: string;
    colorName?: string;
}

export interface OrderCheckoutInput {
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    city?: string;
    notes?: string;
}

export interface BlogPost {
    $id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    category?: string;
    image?: string;
    readTime?: string;
    isActive: boolean;
    isFeatured?: boolean;
    viewsCount?: number;
    productId?: string;
    product_id?: string;
    $createdAt?: string;
    $updatedAt?: string;
}