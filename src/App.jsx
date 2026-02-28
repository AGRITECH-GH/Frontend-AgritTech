import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TechnologySection from "@/components/TechnologySection";
import StakeholdersSection from "@/components/StakeholdersSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import SignUp from "@/pages/SignUp";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import AgentDashboard from "@/pages/AgentDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Ledger from "@/pages/Ledger";

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
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/farmer/dashboard" element={<Dashboard />} />
      <Route path="/farmer/ledger" element={<Ledger />} />
      <Route path="/agent/dashboard" element={<AgentDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
