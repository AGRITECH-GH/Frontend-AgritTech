import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TechnologySection from "@/components/TechnologySection";
import StakeholdersSection from "@/components/StakeholdersSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Loader from "@/components/ui/loader";
import ProtectedRoute from "@/components/ProtectedRoute";

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
const Activity = lazy(() => import("@/pages/Activity"));

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

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-email-change" element={<VerifyEmailChange />} />
          <Route path="/payments/return" element={<PaymentReturn />} />

          {/* Buyer routes - protected */}
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute allowedRoles={["BUYER"]}>
                <Marketplace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace/:id"
            element={
              <ProtectedRoute allowedRoles={["BUYER"]}>
                <MarketplaceDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute allowedRoles={["BUYER"]}>
                <Cart />
              </ProtectedRoute>
            }
          />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
