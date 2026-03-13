import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, profileSchema, orderFormSchema } from "@/lib/schemas";

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "pass123" });
    expect(result.success).toBe(true);
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ email: "", password: "pass123" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "pass123" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "user@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const validData = { name: "John", email: "john@gmail.com", phone: "9876543210", password: "secure123" };

  it("accepts valid registration data", () => {
    expect(registerSchema.safeParse(validData).success).toBe(true);
  });

  it("rejects non-gmail email", () => {
    expect(registerSchema.safeParse({ ...validData, email: "john@yahoo.com" }).success).toBe(false);
  });

  it("rejects phone not exactly 10 digits", () => {
    expect(registerSchema.safeParse({ ...validData, phone: "123" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...validData, phone: "12345678901" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...validData, phone: "98765abc10" }).success).toBe(false);
  });

  it("rejects short password", () => {
    expect(registerSchema.safeParse({ ...validData, password: "12345" }).success).toBe(false);
  });

  it("rejects name over 100 characters", () => {
    expect(registerSchema.safeParse({ ...validData, name: "A".repeat(101) }).success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("accepts valid profile data", () => {
    const result = profileSchema.safeParse({ name: "Jane", email: "jane@gmail.com", phone: "9876543210" });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    expect(profileSchema.safeParse({ name: "", email: "jane@gmail.com", phone: "9876543210" }).success).toBe(false);
  });
});

describe("orderFormSchema", () => {
  const validOrder = {
    name: "John",
    phone: "9876543210",
    email: "john@example.com",
    address: "123 Main St",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600001",
  };

  it("accepts valid order data", () => {
    expect(orderFormSchema.safeParse(validOrder).success).toBe(true);
  });

  it("accepts empty email (optional)", () => {
    expect(orderFormSchema.safeParse({ ...validOrder, email: "" }).success).toBe(true);
  });

  it("rejects invalid pincode (not 6 digits)", () => {
    expect(orderFormSchema.safeParse({ ...validOrder, pincode: "12345" }).success).toBe(false);
    expect(orderFormSchema.safeParse({ ...validOrder, pincode: "abcdef" }).success).toBe(false);
  });

  it("rejects missing address", () => {
    expect(orderFormSchema.safeParse({ ...validOrder, address: "" }).success).toBe(false);
  });

  it("rejects invalid email format", () => {
    expect(orderFormSchema.safeParse({ ...validOrder, email: "not-email" }).success).toBe(false);
  });
});
