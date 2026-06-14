import logo from "@/assets/logo.svg";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-white py-4">
      <div className="container flex flex-col items-center justify-between gap-6 text-xs text-muted md:flex-row">
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <img src={logo} alt="FarmBridge logo" className="h-5 w-5" />
          <span>FarmBridge</span>
        </button>

        <div className="flex gap-6">
          <span className="text-muted">Privacy</span>
          <span className="text-muted">Terms</span>
          <span className="text-muted">Contact</span>
        </div>

        <p className="text-muted">© 2026 FarmBridge. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
