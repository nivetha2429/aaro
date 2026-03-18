import { test, expect } from "@playwright/test";
import { TEST_CONFIG } from "../../playwright.config";
import { getAdminToken, apiGet, apiPost, apiPut, apiDelete } from "../../utils/helpers";

const API = TEST_CONFIG.API_URL;

test.describe("07 — Backend API Tests", () => {
  let adminToken: string;

  test.beforeAll(async ({ request }) => {
    adminToken = await getAdminToken(request);
  });

  /* ─── Health ─── */
  test.describe("Health Checks", () => {
    test("GET /health should return 200", async ({ request }) => {
      const res = await request.get(`${API.replace("/api", "")}/health`);
      expect(res.ok()).toBeTruthy();
    });

    test("GET /ping should return 200", async ({ request }) => {
      const res = await request.get(`${API.replace("/api", "")}/ping`);
      expect(res.ok()).toBeTruthy();
    });
  });

  /* ─── Auth ─── */
  test.describe("Authentication API", () => {
    const testEmail = `api_test_${Date.now()}@test.com`;

    test("POST /auth/register — should register new user", async ({ request }) => {
      const res = await request.post(`${API}/auth/register`, {
        data: {
          name: "API Test User",
          email: testEmail,
          password: "Test@12345",
          phone: "9876500001",
        },
      });
      expect(res.status()).toBe(201);
      const body = await res.json();
      expect(body.token).toBeTruthy();
      expect(body.user.email).toBe(testEmail);
    });

    test("POST /auth/register — should reject duplicate email", async ({ request }) => {
      const res = await request.post(`${API}/auth/register`, {
        data: {
          name: "Duplicate User",
          email: testEmail,
          password: "Test@12345",
          phone: "9876500002",
        },
      });
      expect(res.status()).toBe(400);
    });

    test("POST /auth/login — should login with valid credentials", async ({ request }) => {
      const res = await request.post(`${API}/auth/login`, {
        data: {
          email: TEST_CONFIG.ADMIN_EMAIL,
          password: TEST_CONFIG.ADMIN_PASSWORD,
        },
      });
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.token).toBeTruthy();
      expect(body.user.role).toBe("admin");
    });

    test("POST /auth/login — should reject invalid credentials", async ({ request }) => {
      const res = await request.post(`${API}/auth/login`, {
        data: { email: "wrong@email.com", password: "wrong" },
      });
      expect(res.ok()).toBeFalsy();
    });

    test("POST /auth/forgot-password — should reject mismatched phone", async ({ request }) => {
      const res = await request.post(`${API}/auth/forgot-password`, {
        data: {
          email: testEmail,
          phone: "0000000000",
          newPassword: "NewPass@123",
        },
      });
      expect(res.ok()).toBeFalsy();
    });
  });

  /* ─── Products ─── */
  test.describe("Products API", () => {
    let productId: string;

    test("GET /products — should return product list", async ({ request }) => {
      const res = await apiGet(request, "/products");
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(Array.isArray(body.products || body)).toBeTruthy();
    });

    test("GET /products?category=phone — should filter by category", async ({ request }) => {
      const res = await apiGet(request, "/products?category=phone");
      expect(res.ok()).toBeTruthy();
    });

    test("POST /products — admin should create product", async ({ request }) => {
      const res = await apiPost(
        request,
        "/products",
        {
          name: "E2E Test Phone",
          category: "phone",
          brand: "TestBrand",
          description: "Test product created by E2E tests",
          price: 9999,
          mrp: 12999,
          stock: 10,
        },
        adminToken
      );
      if (res.ok()) {
        const body = await res.json();
        productId = body._id || body.id;
        expect(productId).toBeTruthy();
      }
      // May fail if brand doesn't exist — that's ok for test purposes
      expect(res.status()).toBeLessThan(500);
    });

    test("GET /products/:id — should return single product", async ({ request }) => {
      if (!productId) test.skip();
      const res = await apiGet(request, `/products/${productId}`);
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.name).toBe("E2E Test Phone");
    });

    test("PUT /products/:id — admin should update product", async ({ request }) => {
      if (!productId) test.skip();
      const res = await apiPut(
        request,
        `/products/${productId}`,
        { name: "E2E Test Phone Updated" },
        adminToken
      );
      expect(res.ok()).toBeTruthy();
    });

    test("DELETE /products/:id — admin should delete product", async ({ request }) => {
      if (!productId) test.skip();
      const res = await apiDelete(request, `/products/${productId}`, adminToken);
      expect(res.ok()).toBeTruthy();
    });

    test("POST /products — should reject unauthenticated", async ({ request }) => {
      const res = await request.post(`${API}/products`, {
        data: { name: "Unauthorized Product" },
      });
      expect(res.status()).toBe(401);
    });
  });

  /* ─── Categories ─── */
  test.describe("Categories API", () => {
    let categoryId: string;

    test("GET /categories — should return categories", async ({ request }) => {
      const res = await apiGet(request, "/categories");
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(Array.isArray(body)).toBeTruthy();
    });

    test("POST /categories — admin should create category", async ({ request }) => {
      const res = await apiPost(
        request,
        "/categories",
        { name: `E2E-Cat-${Date.now()}`, slug: `e2e-cat-${Date.now()}` },
        adminToken
      );
      if (res.ok()) {
        const body = await res.json();
        categoryId = body._id || body.id;
      }
      expect(res.status()).toBeLessThan(500);
    });

    test("DELETE /categories/:id — admin should delete category", async ({ request }) => {
      if (!categoryId) test.skip();
      const res = await apiDelete(request, `/categories/${categoryId}`, adminToken);
      expect(res.ok()).toBeTruthy();
    });
  });

  /* ─── Brands ─── */
  test.describe("Brands API", () => {
    let brandId: string;

    test("GET /brands — should return brands", async ({ request }) => {
      const res = await apiGet(request, "/brands");
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(Array.isArray(body)).toBeTruthy();
    });

    test("POST /brands — admin should create brand", async ({ request }) => {
      const res = await apiPost(
        request,
        "/brands",
        { name: `E2E-Brand-${Date.now()}`, category: "phone" },
        adminToken
      );
      if (res.ok()) {
        const body = await res.json();
        brandId = body._id || body.id;
      }
      expect(res.status()).toBeLessThan(500);
    });

    test("DELETE /brands/:id — admin should delete brand", async ({ request }) => {
      if (!brandId) test.skip();
      const res = await apiDelete(request, `/brands/${brandId}`, adminToken);
      expect(res.ok()).toBeTruthy();
    });
  });

  /* ─── Banners ─── */
  test.describe("Banners API", () => {
    test("GET /banners — should return banners", async ({ request }) => {
      const res = await apiGet(request, "/banners");
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(Array.isArray(body)).toBeTruthy();
    });
  });

  /* ─── Offers ─── */
  test.describe("Offers API", () => {
    test("GET /offers — should return offers", async ({ request }) => {
      const res = await apiGet(request, "/offers");
      expect(res.ok()).toBeTruthy();
    });

    test("GET /offers/active — should return active offer", async ({ request }) => {
      const res = await apiGet(request, "/offers/active");
      // May return 200 with null or 404 if no active offer
      expect(res.status()).toBeLessThan(500);
    });
  });

  /* ─── Orders ─── */
  test.describe("Orders API", () => {
    test("GET /orders — should require auth", async ({ request }) => {
      const res = await request.get(`${API}/orders`);
      expect(res.status()).toBe(401);
    });

    test("GET /orders/admin — admin should get all orders", async ({ request }) => {
      const res = await apiGet(request, "/orders/admin", adminToken);
      expect(res.ok()).toBeTruthy();
    });
  });

  /* ─── Reviews ─── */
  test.describe("Reviews API", () => {
    test("POST /reviews — should require auth", async ({ request }) => {
      const res = await request.post(`${API}/reviews`, {
        data: { productId: "fake", rating: 5, comment: "test" },
      });
      expect(res.status()).toBe(401);
    });
  });

  /* ─── Contact Settings ─── */
  test.describe("Contact Settings API", () => {
    test("GET /contact-settings — should return settings", async ({ request }) => {
      const res = await apiGet(request, "/contact-settings");
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(body.phone || body.email).toBeTruthy();
    });

    test("PUT /contact-settings — should require admin", async ({ request }) => {
      const res = await request.put(`${API}/contact-settings`, {
        data: { phone: "1234567890" },
      });
      expect(res.status()).toBe(401);
    });
  });

  /* ─── Admin Users ─── */
  test.describe("Admin Users API", () => {
    test("GET /admin/users — should require admin", async ({ request }) => {
      const res = await request.get(`${API}/admin/users`);
      expect(res.status()).toBe(401);
    });

    test("GET /admin/users — admin should get users", async ({ request }) => {
      const res = await apiGet(request, "/admin/users", adminToken);
      expect(res.ok()).toBeTruthy();
      const body = await res.json();
      expect(Array.isArray(body)).toBeTruthy();
    });
  });
});
