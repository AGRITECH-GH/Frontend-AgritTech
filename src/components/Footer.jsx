import { Link } from "react-router-dom";
import logo from "@/assets/logo.svg";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-white py-4">
      <div className="container flex flex-col items-center justify-between gap-6 text-xs text-muted md:flex-row">
        <Link
          to="/"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <img src={logo} alt="FarmBridge logo" className="h-5 w-5" />
          <span>FarmBridge</span>
        </Link>

        <div className="flex gap-6">
          <Link to="#" className="text-muted hover:underline">Privacy</Link>
          <Link to="#" className="text-muted hover:underline">Terms</Link>
          <Link to="#" className="text-muted hover:underline">Contact</Link>
        </div>

        <p className="text-muted">© 2026 FarmBridge. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
