import logo from "@/assets/logo.svg";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-white py-4">
      <div className="container flex flex-col items-center justify-between gap-6 text-xs text-muted md:flex-row">
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-semibold text-foreground"
        >
          <img src={logo} alt="AgriTech logo" className="h-5 w-5" />
          <span>AgriTech</span>
        </button>

        <div className="flex gap-6">
          <a href="#" className="transition-colors hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Terms
          </a>
          <a href="#" className="transition-colors hover:text-foreground">
            Contact
          </a>
        </div>

        <p className="text-muted">© 2026 AgriTech. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
