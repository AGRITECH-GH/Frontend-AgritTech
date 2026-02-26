import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, animate } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.svg";
import { transition } from "@/motionConfig";

const navItems = [
  { label: "Solutions", id: "solutions" },
  { label: "Technology", id: "innovation" },
  { label: "About Us", id: "about" },
  { label: "Pricing", id: "pricing" },
];

const scrollToSection = (id) => {
  const target = document.getElementById(id);
  if (!target) return;

  const headerOffset = 80;
  const elementPosition = target.getBoundingClientRect().top + window.scrollY;
  const targetPosition = elementPosition - headerOffset;

  animate(window.scrollY, targetPosition, {
    ...transition,
    onUpdate: (latest) => window.scrollTo(0, latest),
  });
};

const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Switch logo color when over light-background sections
  useEffect(() => {
    const lightSections = ["solutions", "innovation"];
    const navHeight = 80;

    const observers = lightSections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setIsLight(true);
          else {
            // Check if any other light section is still intersecting
            const anyLight = lightSections.some((sid) => {
              const s = document.getElementById(sid);
              if (!s) return false;
              const rect = s.getBoundingClientRect();
              return rect.top < navHeight && rect.bottom > 0;
            });
            setIsLight(anyLight);
          }
        },
        {
          rootMargin: `-0px 0px -${window.innerHeight - navHeight}px 0px`,
          threshold: 0,
        },
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  const handleNavClick = (id) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={transition}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-white/10 shadow-soft backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between md:h-20">
        <button
          type="button"
          onClick={() => scrollToSection("hero")}
          className="flex items-center gap-1.5 overflow-hidden text-base font-semibold text-foreground transition-colors duration-300"
          style={{ width: "150.16px", height: "32px" }}
        >
          <img src={logo} alt="AgriTech logo" className="h-6 w-6 shrink-0" />
          <span className="truncate">AgriTech</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className="text-base font-medium text-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="sm"
            className="text-base text-foreground transition-colors hover:text-primary"
          >
            Login
          </Button>
          <Button size="sm" onClick={() => navigate("/signup")}>
            Sign Up
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-full border border-border/70 bg-white/70 p-2 text-foreground shadow-sm backdrop-blur md:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={open ? "open" : "closed"}
        variants={{
          open: { height: "auto", opacity: 1 },
          closed: { height: 0, opacity: 0 },
        }}
        transition={transition}
        className="overflow-hidden border-t border-border/60 bg-white/90 backdrop-blur md:hidden"
      >
        <div className="container flex flex-col gap-4 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className="text-left text-sm font-medium text-muted hover:text-foreground"
            >
              {item.label}
            </button>
          ))}
          <div className="mt-2 flex gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-muted hover:text-foreground"
              onClick={() => navigate("/signup")}
            >
              Login
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
