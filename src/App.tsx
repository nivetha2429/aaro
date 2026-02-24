import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { DataProvider } from "@/context/DataContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Phones from "./pages/Phones";
import Laptops from "./pages/Laptops";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import OrderForm from "./pages/OrderForm";
import Offers from "./pages/Offers";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
    <div className="flex flex-col min-h-screen">
      <Toaster richColors position="bottom-right" />
      {!isAdminPath && <Navbar />}
      <main className={`flex-1 ${!isAdminPath ? "min-h-[calc(100vh-80px)]" : ""}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/phones" element={<Phones />} />
          <Route path="/laptops" element={<Laptops />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Routes */}
          <Route path="/order" element={<ProtectedRoute><OrderForm /></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          <Route path="/offers" element={<Offers />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Navigate to="/login" replace />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdminPath && <Footer />}
      {!isAdminPath && <WhatsAppButton />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <DataProvider>
            <CartProvider>
              <AppContents />
            </CartProvider>
          </DataProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
