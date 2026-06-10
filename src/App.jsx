import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TechnologySection from "@/components/TechnologySection";
import StakeholdersSection from "@/components/StakeholdersSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Loader from "@/components/ui/loader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import { ToastProvider } from "@/context/ToastContext";
import SeoMeta from "@/components/SeoMeta";
import RoleSetupRequired from "@/components/RoleSetupRequired";

const SignUp = lazy(() => import("@/pages/SignUp"));
const Login = lazy(() => import("@/pages/Login"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const VerifyEmailChange = lazy(() => import("@/pages/VerifyEmailChange"));
const GoogleAuthSuccess = lazy(() => import("@/pages/GoogleAuthSuccess"));
const CompleteRoleSetup = lazy(() => import("@/pages/CompleteRoleSetup"));
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

function AppSeo() {
  const location = useLocation();
  const { pathname } = location;

  if (pathname === "/" || pathname === "/marketplace") {
    return (
      <SeoMeta
        title="Marketplace | FarmBridge Ghana"
        description="Browse fresh produce, pantry goods, dairy, and livestock from verified sellers across Ghana."
        canonicalPath="/"
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
    pathname === "/complete-role-setup" ||
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

// A wrapper to apply ErrorBoundary per route
const RouteBoundary = ({ children }) => (
  <ErrorBoundary>
    {children}
  </ErrorBoundary>
);

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/marketplace" replace />} />
        <Route path="/signup" element={<RouteBoundary><SignUp /></RouteBoundary>} />
        <Route path="/login" element={<RouteBoundary><Login /></RouteBoundary>} />
        <Route path="/forgot-password" element={<RouteBoundary><ForgotPassword /></RouteBoundary>} />
        <Route path="/reset-password" element={<RouteBoundary><ResetPassword /></RouteBoundary>} />
        <Route path="/verify" element={<RouteBoundary><VerifyEmail /></RouteBoundary>} />
        <Route path="/verify-email-change" element={<RouteBoundary><VerifyEmailChange /></RouteBoundary>} />
        <Route path="/payments/return" element={<RouteBoundary><PaymentReturn /></RouteBoundary>} />
        <Route path="/profile/:userId" element={<RouteBoundary><PublicProfile /></RouteBoundary>} />

        {/* Buyer routes */}
        <Route path="/marketplace" element={<RouteBoundary><Marketplace /></RouteBoundary>} />
        <Route path="/marketplace/:id" element={<RouteBoundary><MarketplaceDetails /></RouteBoundary>} />
        <Route path="/cart" element={<RouteBoundary><Cart /></RouteBoundary>} />
        <Route path="/checkout" element={<RouteBoundary><ProtectedRoute allowedRoles={["BUYER"]}><Checkout /></ProtectedRoute></RouteBoundary>} />
        <Route path="/orders" element={<RouteBoundary><ProtectedRoute><Orders /></ProtectedRoute></RouteBoundary>} />
        <Route path="/orders/:id" element={<RouteBoundary><ProtectedRoute><Orders /></ProtectedRoute></RouteBoundary>} />
        <Route path="/reviews" element={<RouteBoundary><ProtectedRoute><Reviews /></ProtectedRoute></RouteBoundary>} />
        <Route path="/reviews/new" element={<RouteBoundary><ProtectedRoute><Reviews /></ProtectedRoute></RouteBoundary>} />
        <Route path="/disputes" element={<RouteBoundary><ProtectedRoute><Disputes /></ProtectedRoute></RouteBoundary>} />
        <Route path="/disputes/new" element={<RouteBoundary><ProtectedRoute><Disputes /></ProtectedRoute></RouteBoundary>} />

        {/* Farmer routes - protected */}
        <Route path="/farmer/dashboard" element={<RouteBoundary><ProtectedRoute allowedRoles={["FARMER"]}><Dashboard /></ProtectedRoute></RouteBoundary>} />
        <Route path="/farmer/ledger" element={<RouteBoundary><ProtectedRoute allowedRoles={["FARMER"]}><Ledger /></ProtectedRoute></RouteBoundary>} />
        <Route path="/farmer/inventory" element={<RouteBoundary><ProtectedRoute allowedRoles={["FARMER"]}><Inventory /></ProtectedRoute></RouteBoundary>} />
        <Route path="/farmer/inventory/add-product" element={<RouteBoundary><ProtectedRoute allowedRoles={["FARMER"]}><AddProduct /></ProtectedRoute></RouteBoundary>} />
        <Route path="/farmer/proposals" element={<RouteBoundary><ProtectedRoute allowedRoles={["FARMER"]}><BarterProposals /></ProtectedRoute></RouteBoundary>} />
        <Route path="/activity" element={<RouteBoundary><ProtectedRoute allowedRoles={["FARMER"]}><Activity /></ProtectedRoute></RouteBoundary>} />

        {/* Agent routes - protected */}
        <Route path="/agent/dashboard" element={<RouteBoundary><ProtectedRoute allowedRoles={["AGENT"]}><AgentDashboard /></ProtectedRoute></RouteBoundary>} />
        <Route path="/agent/farmers" element={<RouteBoundary><ProtectedRoute allowedRoles={["AGENT"]}><AgentFarmers /></ProtectedRoute></RouteBoundary>} />

        {/* Profile route - protected */}
        <Route path="/profile" element={<RouteBoundary><ProtectedRoute><Profile /></ProtectedRoute></RouteBoundary>} />

        {/* Messages / inbox routes - protected */}
        <Route path="/messages" element={<RouteBoundary><ProtectedRoute><Messages /></ProtectedRoute></RouteBoundary>} />
        <Route path="/messages/:conversationId" element={<RouteBoundary><ProtectedRoute><Messages /></ProtectedRoute></RouteBoundary>} />

        {/* Admin routes - protected */}
        <Route path="/admin/dashboard" element={<RouteBoundary><ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute></RouteBoundary>} />
        <Route path="/admin/listings" element={<RouteBoundary><ProtectedRoute allowedRoles={["ADMIN"]}><AdminListings /></ProtectedRoute></RouteBoundary>} />
        <Route path="/admin/users" element={<RouteBoundary><ProtectedRoute allowedRoles={["ADMIN"]}><AdminUsers /></ProtectedRoute></RouteBoundary>} />
        <Route path="/admin/revenue" element={<RouteBoundary><ProtectedRoute allowedRoles={["ADMIN"]}><AdminRevenue /></ProtectedRoute></RouteBoundary>} />
        <Route path="/admin/settings" element={<RouteBoundary><ProtectedRoute allowedRoles={["ADMIN"]}><AdminSettings /></ProtectedRoute></RouteBoundary>} />
        <Route path="/admin/disputes" element={<RouteBoundary><ProtectedRoute allowedRoles={["ADMIN"]}><AdminDisputes /></ProtectedRoute></RouteBoundary>} />
        <Route path="*" element={<RouteBoundary><NotFound /></RouteBoundary>} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
