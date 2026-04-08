import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/catalog/products (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/catalog/products')
      .expect(200);

    expect(response.body.items).toBeDefined();
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  it('/catalog/admin/products (POST) rejects anonymous users', () => {
    return request(app.getHttpServer())
      .post('/catalog/admin/products')
      .send({
        name: 'Aura Everyday Tee',
        slug: 'aura-everyday-tee',
        variants: [
          {
            sku: 'TEE-BLK-M',
            title: 'Black / Medium',
            attributes: { color: 'black', size: 'M' },
            prices: [{ currencyCode: 'USD', amount: 29.99 }],
            inventoryOnHand: 10,
          },
        ],
      })
      .expect(401);
  });

  it('/catalog/admin/products (POST) allows admin creation', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@aura.local',
        password: 'Admin123!',
      })
      .expect(201);

    const { accessToken } = loginResponse.body;

    const createResponse = await request(app.getHttpServer())
      .post('/catalog/admin/products')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Aura Everyday Tee',
        slug: 'aura-everyday-tee',
        description: 'Soft cotton tee for daily wear.',
        status: 'ACTIVE',
        category: { name: 'Apparel', slug: 'apparel' },
        tags: [
          { name: 'Featured', slug: 'featured' },
          { name: 'Summer', slug: 'summer' },
        ],
        variants: [
          {
            sku: 'TEE-BLK-M',
            title: 'Black / Medium',
            attributes: { color: 'black', size: 'M' },
            prices: [{ currencyCode: 'USD', amount: 29.99 }],
            inventoryOnHand: 10,
          },
        ],
      })
      .expect(201);

    expect(createResponse.body.slug).toBe('aura-everyday-tee');
    expect(createResponse.body.variants).toHaveLength(1);
  });

  afterEach(async () => {
    await app.close();
  });
});
