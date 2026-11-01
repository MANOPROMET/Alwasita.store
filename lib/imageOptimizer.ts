import sharp from 'sharp';

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export interface OptimizedImageResult {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  originalSize: number;
  optimizedSize: number;
}

/**
 * دالة مركزية لتحسين وضغط الصور قبل رفعها إلى التخزين السحابي:
 * 1. ضبط اتجاه الصورة تلقائياً حسب بيانات الكاميرا (Auto-rotate EXIF)
 * 2. تصغير الأبعاد المفرطة دون تكبير الصور الصغيرة (withoutEnlargement)
 * 3. التحويل إلى صيغة WebP الحديثة فائقة الضغط والسرعة
 * 4. إزالة بيانات EXIF الوصفية الزائدة لحماية الخصوصية وتوفير الحجم
 * 5. معالجة آمنة: في حال فشل أي ملف غير مدعوم، يتم التراجع للصورة الأصلية دون توقف النظام
 */
export async function optimizeImage(
  buffer: Buffer,
  originalFileName: string = 'image.jpg',
  options?: OptimizeImageOptions
): Promise<OptimizedImageResult> {
  const originalSize = buffer.length;

  // إذا كانت الصورة SVG أو خالية، نتجاوز المعالجة
  const lowerName = originalFileName.toLowerCase();
  if (lowerName.endsWith('.svg') || lowerName.endsWith('.gif')) {
    return {
      buffer,
      fileName: originalFileName,
      mimeType: lowerName.endsWith('.svg') ? 'image/svg+xml' : 'image/gif',
      originalSize,
      optimizedSize: originalSize,
    };
  }

  const maxWidth = options?.maxWidth ?? 1200;
  const maxHeight = options?.maxHeight ?? 1200;
  const quality = options?.quality ?? 80;
  const format = options?.format ?? 'webp';

  try {
    const image = sharp(buffer);

    // تدوير تلقائي بحسب مستشعر الكاميرا وضبط المقاسات
    let pipeline = image.rotate().resize({
      width: maxWidth,
      height: maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    });

    if (format === 'webp') {
      pipeline = pipeline.webp({ quality, effort: 4 });
    } else if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality, progressive: true, mozjpeg: true });
    } else if (format === 'png') {
      pipeline = pipeline.png({ quality, compressionLevel: 8 });
    }

    const optimizedBuffer = await pipeline.toBuffer();

    // استخراج الاسم الأساسي وتغيير الامتداد إلى الصيغة الجديدة
    const lastDotIndex = originalFileName.lastIndexOf('.');
    const baseName = lastDotIndex !== -1 ? originalFileName.substring(0, lastDotIndex) : originalFileName;
    const cleanBaseName = baseName.replace(/[^\w\u0600-\u06FF-]/g, '_') || 'image';
    const newFileName = `${cleanBaseName}.${format}`;

    const mimeMap: Record<string, string> = {
      webp: 'image/webp',
      jpeg: 'image/jpeg',
      png: 'image/png',
    };

    return {
      buffer: optimizedBuffer,
      fileName: newFileName,
      mimeType: mimeMap[format] || 'image/webp',
      originalSize,
      optimizedSize: optimizedBuffer.length,
    };
  } catch (error) {
    console.warn(`[imageOptimizer] فشل ضغط الصورة ${originalFileName}، سيتم استخدام الأصلية:`, error);
    return {
      buffer,
      fileName: originalFileName,
      mimeType: 'application/octet-stream',
      originalSize,
      optimizedSize: originalSize,
    };
  }
}
