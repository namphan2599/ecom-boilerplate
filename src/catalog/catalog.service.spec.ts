import { BadRequestException } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { CatalogService } from './catalog.service';

describe('CatalogService media storage', () => {
  let service: CatalogService;

  beforeEach(() => {
    service = new CatalogService(new PrismaService(), new StorageService());
  });

  it('uploads and deletes a product hero image in fallback mode', async () => {
    const product = await service.createProduct({
      name: 'Aura Media Tee',
      slug: 'aura-media-tee-unit',
      status: ProductStatus.ACTIVE,
      variants: [
        {
          sku: 'TEE-MEDIA-UNIT',
          title: 'Black / Medium',
          attributes: { color: 'black', size: 'M' },
          prices: [{ currencyCode: 'USD', amount: 39.99 }],
        },
      ],
    });

    const uploaded = await service.uploadProductImage(product.id, {
      originalname: 'hero.png',
      mimetype: 'image/png',
      size: 16,
      buffer: Buffer.from('fake-image-bytes'),
    });

    expect(uploaded.imageUrl).toMatch(/^https?:\/\//);
    expect(uploaded.imageKey).toContain(`products/${product.id}/`);

    const cleared = await service.deleteProductImage(product.id);

    expect(cleared.imageUrl).toBeNull();
    expect(cleared.imageKey).toBeNull();
  });

  it('rejects uploads for archived products', async () => {
    const product = await service.createProduct({
      name: 'Aura Archived Tee',
      slug: 'aura-archived-tee-unit',
      status: ProductStatus.ARCHIVED,
      variants: [
        {
          sku: 'TEE-ARCHIVED-UNIT',
          title: 'Grey / Medium',
          attributes: { color: 'grey', size: 'M' },
          prices: [{ currencyCode: 'USD', amount: 29.99 }],
        },
      ],
    });

    await expect(
      service.uploadProductImage(product.id, {
        originalname: 'hero.webp',
        mimetype: 'image/webp',
        size: 16,
        buffer: Buffer.from('fake-image-bytes'),
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
