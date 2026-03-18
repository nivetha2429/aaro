import { lazy, Suspense, Component, useEffect } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { DataProvider, useData } from "@/context/DataContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileNav from "@/components/MobileNav";
import AdminRoute from "@/components/AdminRoute";
import { OfferPopup } from "@/components/OfferPopup";
import logo from "@/assets/logo.png";

// Eager-load the home page (critical path)
import Index from "./pages/Index";

// Lazy-load all other pages — splits bundle into on-demand chunks
const Shop = lazy(() => import("./pages/Shop"));
const Phones = lazy(() => import("./pages/Phones"));
const Laptops = lazy(() => import("./pages/Laptops"));
const Accessories = lazy(() => import("./pages/Accessories"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const Cart = lazy(() => import("./pages/Cart"));
const OrderForm = lazy(() => import("./pages/OrderForm"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const CustomerDashboard = lazy(() => import("./pages/CustomerDashboard"));
const Brands = lazy(() => import("./pages/Brands"));
const Contact = lazy(() => import("./pages/Contact"));
const Community = lazy(() => import("./pages/Community"));
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

const AaroLoader = ({ fullScreen = false }: { fullScreen?: boolean }) => (
  <div className={`${fullScreen ? "min-h-screen" : "min-h-[60vh]"} flex items-center justify-center bg-background`}>
    <div className="flex flex-col items-center gap-5">
      <img src={logo} alt="AARO" className="h-16 sm:h-20 w-auto object-contain aaro-loader-logo" />
      <div className="w-32 h-1 rounded-full bg-primary/10 aaro-loader-bar" />
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-primary aaro-dot-1" />
        <div className="w-2 h-2 rounded-full bg-primary aaro-dot-2" />
        <div className="w-2 h-2 rounded-full bg-primary aaro-dot-3" />
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <AaroLoader fullScreen />;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const ICON_PAGES = ["/", "/phones", "/laptops", "/accessories", "/brands", "/contact", "/community"];

const AppContents = () => {
  const location = useLocation();
  const { loading: dataLoading } = useData();
  const isAdminPath = location.pathname.startsWith("/admin");
  const showIcons = ICON_PAGES.includes(location.pathname);

  if (dataLoading) {
    return <AaroLoader fullScreen />;
  }

  return (
    <div className="w-full min-h-screen bg-background selection:bg-primary/20">
      <ScrollToTop />
      <div className="w-full bg-background min-h-screen flex flex-col relative">
        <Toaster richColors position="bottom-right" />
        {!isAdminPath && <Navbar />}
        <main className={`flex-1 ${!isAdminPath ? "pb-20 lg:pb-0" : ""}`}>
          <div key={location.pathname} className="page-transition">
            <Suspense fallback={<AaroLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/phones" element={<Phones />} />
                <Route path="/laptops" element={<Laptops />} />
                <Route path="/accessories" element={<Accessories />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Customer Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
                <Route path="/order" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />
                <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                <Route path="/contact" element={<Contact />} />
                <Route path="/community" element={<Community />} />
                <Route path="/elite" element={<Navigate to="/community" replace />} />
                <Route path="/whatsapp-group" element={<Navigate to="/community" replace />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </main>
        {!isAdminPath && <Footer />}
        {!isAdminPath && <MobileNav />}
        {showIcons && <WhatsAppButton />}
      </div>
      {showIcons && <OfferPopup />}
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
                <ErrorBoundary>
                  <AppContents />
                </ErrorBoundary>
            </CartProvider>
          </DataProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </HelmetProvider>
);

export default App;
