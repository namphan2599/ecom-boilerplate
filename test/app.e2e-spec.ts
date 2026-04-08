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

  it('/cart (GET) rejects anonymous users', () => {
    return request(app.getHttpServer()).get('/cart').expect(401);
  });

  it('/cart/items (POST) stores an authenticated cart snapshot', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'customer@aura.local',
        password: 'Customer123!',
      })
      .expect(201);

    const { accessToken } = loginResponse.body;

    const addResponse = await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sku: 'HOODIE-BLK-M',
        quantity: 2,
        currencyCode: 'USD',
      })
      .expect(201);

    expect(addResponse.body.items).toHaveLength(1);
    expect(addResponse.body.items[0].sku).toBe('HOODIE-BLK-M');
    expect(addResponse.body.items[0].quantity).toBe(2);
    expect(addResponse.body.summary.currencyCode).toBe('USD');
    expect(addResponse.body.summary.itemCount).toBe(2);

    const cartResponse = await request(app.getHttpServer())
      .get('/cart')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(cartResponse.body.items).toHaveLength(1);
    expect(cartResponse.body.items[0].unitPrice).toBe(79.99);
    expect(cartResponse.body.summary.subtotal).toBe(159.98);
  });

  afterEach(async () => {
    await app.close();
  });
});
