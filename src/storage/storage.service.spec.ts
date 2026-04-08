import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { StorageService } from './rustfs-storage.service';

describe('RustfsStorageService', () => {
  const originalEnv = {
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
  };

  beforeEach(() => {
    delete process.env.S3_ENDPOINT;
    delete process.env.S3_PUBLIC_BASE_URL;
    delete process.env.S3_ACCESS_KEY;
    delete process.env.S3_SECRET_KEY;
  });

  afterEach(() => {
    process.env.S3_ENDPOINT = originalEnv.S3_ENDPOINT;
    process.env.S3_PUBLIC_BASE_URL = originalEnv.S3_PUBLIC_BASE_URL;
    process.env.S3_ACCESS_KEY = originalEnv.S3_ACCESS_KEY;
    process.env.S3_SECRET_KEY = originalEnv.S3_SECRET_KEY;
  });

  it('uploads and deletes objects using the fallback store when S3 is not configured', async () => {
    const service = new StorageService();

    expect(service.isUsingFallback()).toBe(true);

    const result = await service.uploadObject({
      bucket: 'product-images',
      key: 'products/prod_123/hero.png',
      body: Buffer.from('fake-image-bytes'),
      contentType: 'image/png',
      contentLength: 16,
    });

    expect(result.url).toBe('https://rustfs.local/product-images/products/prod_123/hero.png');

    await expect(
      service.deleteObject({
        bucket: 'product-images',
        key: 'products/prod_123/hero.png',
      }),
    ).resolves.toBeUndefined();
  });

  it('builds public URLs from S3_PUBLIC_BASE_URL when configured', () => {
    process.env.S3_PUBLIC_BASE_URL = 'https://cdn.aura.local/product-images';

    const service = new StorageService();

    expect(service.getPublicUrl('product-images', 'products/prod_123/hero image.png')).toBe(
      'https://cdn.aura.local/product-images/products/prod_123/hero%20image.png',
    );
  });
});
