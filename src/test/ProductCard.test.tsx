import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "@/components/ProductCard";

// Mock all context hooks
vi.mock("@/context/CartContext", () => ({
  useCart: () => ({ addToCart: vi.fn() }),
}));
vi.mock("@/context/DataContext", () => ({
  useData: () => ({ fetchVariants: vi.fn().mockResolvedValue([]) }),
}));
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ isAdmin: false }),
}));

const mockProduct = {
  id: "prod-1",
  name: "iPhone 15 Pro",
  brand: "Apple",
  category: "phone" as const,
  description: "Latest iPhone",
  images: ["/img/iphone.jpg"],
  rating: 4.5,
  reviewCount: 120,
  tag: "New",
  variants: [
    { ram: "8GB", storage: "256GB", color: "Black", price: 134900, originalPrice: 149900, stock: 10 },
  ],
};

describe("ProductCard", () => {
  const renderCard = () =>
    render(
      <MemoryRouter>
        <ProductCard product={mockProduct as any} />
      </MemoryRouter>
    );

  it("renders the product name", () => {
    renderCard();
    expect(screen.getByText("iPhone 15 Pro")).toBeInTheDocument();
  });

  it("renders the brand", () => {
    renderCard();
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("renders the price", () => {
    renderCard();
    expect(screen.getByText("₹134,900")).toBeInTheDocument();
  });

  it("renders the discount badge", () => {
    renderCard();
    expect(screen.getByText("-10%")).toBeInTheDocument();
  });

  it("renders the tag", () => {
    renderCard();
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("renders Add to Cart button", () => {
    renderCard();
    expect(screen.getByText("Add to Cart")).toBeInTheDocument();
  });

  it("shows review count", () => {
    renderCard();
    expect(screen.getByText("(120)")).toBeInTheDocument();
  });

});
