import { lazy, Suspense, Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { DataProvider } from "@/context/DataContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileNav from "@/components/MobileNav";

// Eager-load the home page (critical path)
import Index from "./pages/Index";

// Lazy-load all other pages — splits bundle into on-demand chunks
const Shop = lazy(() => import("./pages/Shop"));
const Phones = lazy(() => import("./pages/Phones"));
const Laptops = lazy(() => import("./pages/Laptops"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const OrderForm = lazy(() => import("./pages/OrderForm"));
const Offers = lazy(() => import("./pages/Offers"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const Brands = lazy(() => import("./pages/Brands"));
const Elite = lazy(() => import("./pages/Elite"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Global error boundary — prevents white-screen crashes
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md">
            <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">An unexpected error occurred. Please try refreshing the page.</p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.href = "/"; }}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground font-medium animate-pulse">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const AppContents = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex justify-center selection:bg-primary/20">
      <div className="w-full max-w-[1400px] bg-background shadow-2xl min-h-screen flex flex-col relative overflow-hidden">
        <Toaster richColors position="bottom-right" />
        {!isAdminPath && <Navbar />}
        <main className={`flex-1 flex flex-col ${!isAdminPath ? "min-h-[calc(100vh-80px)]" : ""}`}>
          <div key={location.pathname} className="page-transition flex-1 flex flex-col">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/phones" element={<Phones />} />
                <Route path="/laptops" element={<Laptops />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Customer Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
                <Route path="/order" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />
                <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/elite" element={<Elite />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </main>
        {!isAdminPath && <Footer />}
        {!isAdminPath && <MobileNav />}
        {!isAdminPath && <WhatsAppButton />}
      </div>
    </div>
  );
};

const App = () => (
  <HelmetProvider>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <DataProvider>
            <CartProvider>
              <WishlistProvider>
                <ErrorBoundary>
                  <AppContents />
                </ErrorBoundary>
              </WishlistProvider>
            </CartProvider>
          </DataProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </HelmetProvider>
);

export default App;
