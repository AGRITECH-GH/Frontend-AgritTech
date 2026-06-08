import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TechnologySection from "@/components/TechnologySection";
import StakeholdersSection from "@/components/StakeholdersSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Loader from "@/components/ui/loader";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const SignUp = lazy(() => import("@/pages/SignUp"));
const Login = lazy(() => import("@/pages/Login"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));
const VerifyEmailChange = lazy(() => import("@/pages/VerifyEmailChange"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AgentDashboard = lazy(() => import("@/pages/AgentDashboard"));
const AgentFarmers = lazy(() => import("@/pages/AgentFarmers"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
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
