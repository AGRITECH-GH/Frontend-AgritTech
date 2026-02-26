import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-farmland.jpg";
import { transition } from "@/motionConfig";

const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20 pb-20 md:pt-24 md:pb-24"
    >
      {/* Background image */}
      <div className="pointer-events-none absolute inset-0">
        <img
          src={heroImg}
          alt="Aerial view of futuristic green farmland"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-primary-dark/40 to-transparent" />
      </div>

      <div className="container relative z-10 flex flex-col items-center text-center text-white">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.1 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/60 bg-primary-dark/70 px-5 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300 backdrop-blur"
        >
          Sustainability First
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.25 }}
          className="max-w-3xl mx-auto font-heading text-6xl font-bold leading-tight tracking-tight sm:text-7xl md:text-8xl lg:text-9xl"
        >
          The Future
          <br />
          of <span className="text-primary">Farming</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.4 }}
          className="mt-6 mx-auto max-w-2xl text-sm text-white/80 sm:text-base md:text-lg"
        >
          Revolutionizing agriculture through smart technology and sustainable
          practices for a greener, more productive tomorrow.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition, delay: 0.55 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="rounded-2xl px-10 text-sm font-semibold md:text-base"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-2xl border-transparent bg-primary-dark/80 text-white hover:bg-primary-dark"
          >
            View Demo
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
