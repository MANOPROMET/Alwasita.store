// lib/appwrite/utils.ts
// دوال مساعدة آمنة للمتصفح والعميل (Client & Server safe)

export function getProductImageUrl(fileId?: string): string {
  if (!fileId || typeof fileId !== 'string' || !fileId.trim()) return '/window.svg';
  if (
    fileId.startsWith('/') ||
    fileId.startsWith('http://') ||
    fileId.startsWith('https://')
  ) {
    return fileId;
  }
  const endpoint =
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
  const project =
    process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6a79cc3c0029e33756c8';
  const bucketId =
    process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID || 'products';
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${project}`;
}
