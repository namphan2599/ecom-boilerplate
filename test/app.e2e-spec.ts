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

  it('/checkout/session (POST) creates a hosted session and accepts a Stripe webhook', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'customer@aura.local',
        password: 'Customer123!',
      })
      .expect(201);

    const { accessToken } = loginResponse.body;

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sku: 'HOODIE-BLK-M',
        quantity: 1,
        currencyCode: 'USD',
      })
      .expect(201);

    const checkoutResponse = await request(app.getHttpServer())
      .post('/checkout/session')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        couponCode: 'AURA20',
        successUrl: 'https://storefront.aura.local/success',
        cancelUrl: 'https://storefront.aura.local/cancel',
      })
      .expect(201);

    expect(checkoutResponse.body.sessionId).toMatch(/^cs_test_/);
    expect(checkoutResponse.body.order.status).toBe('PENDING');
    expect(checkoutResponse.body.order.currencyCode).toBe('USD');

    const webhookResponse = await request(app.getHttpServer())
      .post('/webhooks/stripe')
      .set('stripe-signature', 'test_signature')
      .send({
        id: 'evt_checkout_completed_e2e',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: checkoutResponse.body.sessionId,
            payment_intent: 'pi_e2e_123',
            metadata: {
              checkoutToken: checkoutResponse.body.checkoutToken,
            },
          },
        },
      })
      .expect(200);

    expect(webhookResponse.body).toEqual({
      received: true,
      type: 'checkout.session.completed',
    });
  });

  it('/orders/me (GET) returns only the authenticated customer history', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'customer@aura.local',
        password: 'Customer123!',
      })
      .expect(201);

    const { accessToken } = loginResponse.body;

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        sku: 'HOODIE-BLK-M',
        quantity: 1,
        currencyCode: 'USD',
      })
      .expect(201);

    const checkoutResponse = await request(app.getHttpServer())
      .post('/checkout/session')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({})
      .expect(201);

    await request(app.getHttpServer())
      .post('/webhooks/stripe')
      .set('stripe-signature', 'test_signature')
      .send({
        id: 'evt_order_history_paid',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: checkoutResponse.body.sessionId,
            payment_intent: 'pi_history_123',
            metadata: {
              checkoutToken: checkoutResponse.body.checkoutToken,
            },
          },
        },
      })
      .expect(200);

    const ordersResponse = await request(app.getHttpServer())
      .get('/orders/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(Array.isArray(ordersResponse.body.items)).toBe(true);
    expect(ordersResponse.body.items).toHaveLength(1);
    expect(ordersResponse.body.items[0].status).toBe('PAID');
    expect(ordersResponse.body.items[0].userId).toBe('customer-local');
  });

  it('/orders/admin/:orderNumber/status (PATCH) allows admin and rejects customers', async () => {
    const customerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'customer@aura.local',
        password: 'Customer123!',
      })
      .expect(201);

    const customerToken = customerLogin.body.accessToken as string;

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        sku: 'HOODIE-BLK-M',
        quantity: 1,
        currencyCode: 'USD',
      })
      .expect(201);

    const checkoutResponse = await request(app.getHttpServer())
      .post('/checkout/session')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({})
      .expect(201);

    const orderNumber = checkoutResponse.body.order.orderNumber as string;

    await request(app.getHttpServer())
      .post('/webhooks/stripe')
      .set('stripe-signature', 'test_signature')
      .send({
        id: 'evt_admin_status_paid',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: checkoutResponse.body.sessionId,
            payment_intent: 'pi_admin_status_123',
            metadata: {
              checkoutToken: checkoutResponse.body.checkoutToken,
            },
          },
        },
      })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/orders/admin/${orderNumber}/status`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ status: 'SHIPPED' })
      .expect(403);

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@aura.local',
        password: 'Admin123!',
      })
      .expect(201);

    const adminToken = adminLogin.body.accessToken as string;

    const updateResponse = await request(app.getHttpServer())
      .patch(`/orders/admin/${orderNumber}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'SHIPPED' })
      .expect(200);

    expect(updateResponse.body.orderNumber).toBe(orderNumber);
    expect(updateResponse.body.status).toBe('SHIPPED');
  });

  it('/orders/admin (GET) returns the admin fulfillment queue', async () => {
    const customerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'customer@aura.local',
        password: 'Customer123!',
      })
      .expect(201);

    const customerToken = customerLogin.body.accessToken as string;

    await request(app.getHttpServer())
      .post('/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        sku: 'HOODIE-BLK-M',
        quantity: 1,
        currencyCode: 'USD',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/checkout/session')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({})
      .expect(201);

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@aura.local',
        password: 'Admin123!',
      })
      .expect(201);

    const adminToken = adminLogin.body.accessToken as string;

    const queueResponse = await request(app.getHttpServer())
      .get('/orders/admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(queueResponse.body.items)).toBe(true);
    expect(queueResponse.body.total).toBeGreaterThanOrEqual(1);
    expect(queueResponse.body.items[0].orderNumber).toMatch(/^AURA-/);
  });

  afterEach(async () => {
    await app.close();
  });
});
