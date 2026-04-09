import { S3Client } from '@aws-sdk/client-s3';
import { ServiceUnavailableException } from '@nestjs/common';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  const originalEnv = {
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_PUBLIC_BASE_URL: process.env.S3_PUBLIC_BASE_URL,
    S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
    S3_SECRET_KEY: process.env.S3_SECRET_KEY,
    S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE,
  };

  const restoreEnvValue = (key: keyof typeof originalEnv, value: string | undefined) => {
    if (value === undefined) {
      delete process.env[key];
      return;
    }

    process.env[key] = value;
  };

  beforeEach(() => {
    delete process.env.S3_ENDPOINT;
    delete process.env.S3_PUBLIC_BASE_URL;
    delete process.env.S3_ACCESS_KEY;
    delete process.env.S3_SECRET_KEY;
    delete process.env.S3_FORCE_PATH_STYLE;
    jest.restoreAllMocks();
  });

  afterEach(() => {
    restoreEnvValue('S3_ENDPOINT', originalEnv.S3_ENDPOINT);
    restoreEnvValue('S3_PUBLIC_BASE_URL', originalEnv.S3_PUBLIC_BASE_URL);
    restoreEnvValue('S3_ACCESS_KEY', originalEnv.S3_ACCESS_KEY);
    restoreEnvValue('S3_SECRET_KEY', originalEnv.S3_SECRET_KEY);
    restoreEnvValue('S3_FORCE_PATH_STYLE', originalEnv.S3_FORCE_PATH_STYLE);
    jest.restoreAllMocks();
  });

  it('uploads and deletes objects using the fallback store when S3 is not configured', async () => {
    const service = new StorageService();

    expect(service.getDefaultBucket()).toBe('product-images');
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

  it('builds path-style URLs from the configured endpoint by default', () => {
    process.env.S3_ENDPOINT = 'http://localhost:9100/';

    const service = new StorageService();

    expect(service.getPublicUrl('product-images', 'products/prod_123/hero image.png')).toBe(
      'http://localhost:9100/product-images/products/prod_123/hero%20image.png',
    );
  });

  it('builds virtual-hosted-style URLs when path-style mode is disabled', () => {
    process.env.S3_ENDPOINT = 'https://rustfs.local:9000';
    process.env.S3_FORCE_PATH_STYLE = 'false';

    const service = new StorageService();

    expect(service.getPublicUrl('product-images', 'products/prod_123/hero image.png')).toBe(
      'https://product-images.rustfs.local:9000/products/prod_123/hero%20image.png',
    );
  });

  it('creates the bucket automatically when the initial head check fails', async () => {
    process.env.S3_ENDPOINT = 'http://localhost:9100';
    process.env.S3_ACCESS_KEY = 'rustfsadmin';
    process.env.S3_SECRET_KEY = 'rustfsadmin';

    const sendMock = jest.spyOn(S3Client.prototype, 'send');
    sendMock
      .mockRejectedValueOnce(new Error('Not Found'))
      .mockResolvedValueOnce({} as never)
      .mockResolvedValueOnce({} as never);

    const service = new StorageService();
    const result = await service.uploadObject({
      bucket: 'product-images',
      key: 'products/prod_123/hero.png',
      body: Buffer.from('fake-image-bytes'),
      contentType: 'image/png',
      contentLength: 16,
    });

    expect(service.isUsingFallback()).toBe(false);
    expect(result).toEqual({
      bucket: 'product-images',
      key: 'products/prod_123/hero.png',
      url: 'http://localhost:9100/product-images/products/prod_123/hero.png',
    });
    expect(sendMock.mock.calls.map(([command]) => command.constructor.name)).toEqual([
      'HeadBucketCommand',
      'CreateBucketCommand',
      'PutObjectCommand',
    ]);
  });

  it('continues uploading when the bucket already exists remotely', async () => {
    process.env.S3_ENDPOINT = 'http://localhost:9100';
    process.env.S3_ACCESS_KEY = 'rustfsadmin';
    process.env.S3_SECRET_KEY = 'rustfsadmin';

    const sendMock = jest.spyOn(S3Client.prototype, 'send');
    sendMock
      .mockRejectedValueOnce(new Error('Not Found'))
      .mockRejectedValueOnce(new Error('BucketAlreadyOwnedByYou'))
      .mockResolvedValueOnce({} as never);

    const service = new StorageService();

    await expect(
      service.uploadObject({
        bucket: 'product-images',
        key: 'products/prod_123/hero.png',
        body: Buffer.from('fake-image-bytes'),
        contentType: 'image/png',
        contentLength: 16,
      }),
    ).resolves.toMatchObject({
      key: 'products/prod_123/hero.png',
      url: 'http://localhost:9100/product-images/products/prod_123/hero.png',
    });

    expect(sendMock).toHaveBeenCalledTimes(3);
  });

  it('reuses the verified bucket cache on later uploads', async () => {
    process.env.S3_ENDPOINT = 'http://localhost:9100';
    process.env.S3_ACCESS_KEY = 'rustfsadmin';
    process.env.S3_SECRET_KEY = 'rustfsadmin';

    const sendMock = jest.spyOn(S3Client.prototype, 'send');
    sendMock
      .mockRejectedValueOnce(new Error('Not Found'))
      .mockResolvedValueOnce({} as never)
      .mockResolvedValueOnce({} as never)
      .mockResolvedValueOnce({} as never);

    const service = new StorageService();

    await service.uploadObject({
      bucket: 'product-images',
      key: 'products/prod_123/hero.png',
      body: Buffer.from('first-image'),
      contentType: 'image/png',
      contentLength: 11,
    });

    await service.uploadObject({
      bucket: 'product-images',
      key: 'products/prod_123/hero-2.png',
      body: Buffer.from('second-image'),
      contentType: 'image/png',
      contentLength: 12,
    });

    expect(sendMock.mock.calls.map(([command]) => command.constructor.name)).toEqual([
      'HeadBucketCommand',
      'CreateBucketCommand',
      'PutObjectCommand',
      'PutObjectCommand',
    ]);
  });

  it('throws a ServiceUnavailableException when bucket creation fails unexpectedly', async () => {
    process.env.S3_ENDPOINT = 'http://localhost:9100';
    process.env.S3_ACCESS_KEY = 'rustfsadmin';
    process.env.S3_SECRET_KEY = 'rustfsadmin';

    const sendMock = jest.spyOn(S3Client.prototype, 'send');
    sendMock
      .mockRejectedValueOnce(new Error('Not Found'))
      .mockRejectedValueOnce(new Error('permission denied'));

    const service = new StorageService();

    await expect(
      service.uploadObject({
        bucket: 'product-images',
        key: 'products/prod_123/hero.png',
        body: Buffer.from('fake-image-bytes'),
        contentType: 'image/png',
        contentLength: 16,
      }),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('throws a ServiceUnavailableException when the S3 upload fails', async () => {
    process.env.S3_ENDPOINT = 'http://localhost:9100';
    process.env.S3_ACCESS_KEY = 'rustfsadmin';
    process.env.S3_SECRET_KEY = 'rustfsadmin';

    const sendMock = jest.spyOn(S3Client.prototype, 'send');
    sendMock
      .mockResolvedValueOnce({} as never)
      .mockRejectedValueOnce(new Error('boom'));

    const service = new StorageService();

    await expect(
      service.uploadObject({
        bucket: 'product-images',
        key: 'products/prod_123/hero.png',
        body: Buffer.from('fake-image-bytes'),
        contentType: 'image/png',
        contentLength: 16,
      }),
    ).rejects.toThrow(ServiceUnavailableException);
  });

  it('throws a ServiceUnavailableException when the S3 delete fails', async () => {
    process.env.S3_ENDPOINT = 'http://localhost:9100';
    process.env.S3_ACCESS_KEY = 'rustfsadmin';
    process.env.S3_SECRET_KEY = 'rustfsadmin';

    jest.spyOn(S3Client.prototype, 'send').mockRejectedValue(new Error('boom'));

    const service = new StorageService();

    await expect(
      service.deleteObject({
        bucket: 'product-images',
        key: 'products/prod_123/hero.png',
      }),
    ).rejects.toThrow(ServiceUnavailableException);
  });
});
