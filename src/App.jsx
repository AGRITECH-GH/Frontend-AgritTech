import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TechnologySection from "@/components/TechnologySection";
import StakeholdersSection from "@/components/StakeholdersSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import SeoMeta from "@/components/SeoMeta";
import Loader from "@/components/ui/loader";
import ProtectedRoute from "@/components/ProtectedRoute";

const SignUp = lazy(() => import("@/pages/SignUp"));
const Login = lazy(() => import("@/pages/Login"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const VerifyEmailChange = lazy(() => import("@/pages/VerifyEmailChange"));
const GoogleAuthSuccess = lazy(() => import("@/pages/GoogleAuthSuccess"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AgentDashboard = lazy(() => import("@/pages/AgentDashboard"));
const AgentFarmers = lazy(() => import("@/pages/AgentFarmers"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const AdminKYC = lazy(() => import("@/pages/AdminKYC"));
const AdminListings = lazy(() => import("@/pages/AdminListings"));
const AdminUsers = lazy(() => import("@/pages/AdminUsers"));
const AdminRevenue = lazy(() => import("@/pages/AdminRevenue"));
const AdminSettings = lazy(() => import("@/pages/AdminSettings"));
const Ledger = lazy(() => import("@/pages/Ledger"));
const BarterProposals = lazy(() => import("@/pages/BarterProposals"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const AddProduct = lazy(() => import("@/pages/AddProduct"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const MarketplaceDetails = lazy(() => import("@/pages/MarketplaceDetails"));
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Orders = lazy(() => import("@/pages/Orders"));
const PaymentReturn = lazy(() => import("@/pages/PaymentReturn"));
const Profile = lazy(() => import("@/pages/Profile"));
const PublicProfile = lazy(() => import("@/pages/PublicProfile"));
const Activity = lazy(() => import("@/pages/Activity"));
const Messages = lazy(() => import("@/pages/Messages"));
const Reviews = lazy(() => import("@/pages/Reviews"));
const Disputes = lazy(() => import("@/pages/Disputes"));
const AdminDisputes = lazy(() => import("@/pages/AdminDisputes"));

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <StakeholdersSection />
        <TechnologySection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

function AppSeo() {
  const location = useLocation();
  const { pathname } = location;

  if (pathname === "/marketplace") {
    return (
      <SeoMeta
        title="Marketplace | FarmBridge Ghana"
        description="Browse fresh produce, pantry goods, dairy, and livestock from verified sellers across Ghana."
        canonicalPath="/marketplace"
      />
    );
  }

  if (pathname.startsWith("/marketplace/")) {
    return (
      <SeoMeta
        title="Product Details | FarmBridge Ghana"
        description="View product details, pricing, and seller information before checkout on FarmBridge."
        canonicalPath={pathname}
      />
    );
  }

  if (pathname === "/login") {
    return (
      <SeoMeta
        title="Log In | FarmBridge Ghana"
        description="Log in to your FarmBridge account to manage orders, inventory, and marketplace activity."
        canonicalPath="/login"
      />
    );
  }

  if (pathname === "/signup") {
    return (
      <SeoMeta
        title="Create Account | FarmBridge Ghana"
        description="Create a FarmBridge account to buy, sell, and connect with verified agents and farmers."
        canonicalPath="/signup"
      />
    );
  }

  if (pathname === "/cart") {
    return (
      <SeoMeta
        title="Cart | FarmBridge Ghana"
        description="Review your selected marketplace items before checkout."
        canonicalPath="/cart"
      />
    );
  }

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/agent") ||
    pathname.startsWith("/farmer") ||
    pathname === "/checkout" ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/profile")
  ) {
    return (
      <SeoMeta
        title="FarmBridge Ghana"
        description="FarmBridge marketplace and agri-commerce platform."
        canonicalPath={pathname}
        robots="noindex,nofollow"
      />
    );
  }

  return (
    <SeoMeta
      title="FarmBridge | Ghana Agri Marketplace"
      description="FarmBridge connects farmers, buyers, and agents to trade agricultural products across Ghana."
      canonicalPath={pathname || "/"}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <SpeedInsights />
      <AppSeo />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/marketplace" replace />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-email-change" element={<VerifyEmailChange />} />
          <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
          <Route path="/payments/return" element={<PaymentReturn />} />
          <Route path="/profile/:userId" element={<PublicProfile />} />

          {/* Buyer routes */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<MarketplaceDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={["BUYER"]}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews/new"
            element={
              <ProtectedRoute>
                <Reviews />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disputes"
            element={
              <ProtectedRoute>
                <Disputes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/disputes/new"
            element={
              <ProtectedRoute>
                <Disputes />
              </ProtectedRoute>
            }
          />

          {/* Farmer routes - protected */}
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["FARMER"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/ledger"
            element={
              <ProtectedRoute allowedRoles={["FARMER"]}>
                <Ledger />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/inventory"
            element={
              <ProtectedRoute allowedRoles={["FARMER"]}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/inventory/add-product"
            element={
              <ProtectedRoute allowedRoles={["FARMER"]}>
                <AddProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/proposals"
            element={
              <ProtectedRoute allowedRoles={["FARMER"]}>
                <BarterProposals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute allowedRoles={["FARMER"]}>
                <Activity />
              </ProtectedRoute>
            }
          />

          {/* Agent routes - protected */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute allowedRoles={["AGENT"]}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/farmers"
            element={
              <ProtectedRoute allowedRoles={["AGENT"]}>
                <AgentFarmers />
              </ProtectedRoute>
            }
          />

          {/* Profile route - protected */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Messages / inbox routes - protected */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:conversationId"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          {/* Admin routes - protected */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/listings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminListings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kyc"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminKYC />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/revenue"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminRevenue />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/disputes"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDisputes />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
