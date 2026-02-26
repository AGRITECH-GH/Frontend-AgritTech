import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ctaImg from "@/assets/CTACard.png";
import { transition } from "@/motionConfig";

const CTASection = () => {
  return (
    <section
      id="pricing"
      className="section-padding bg-gradient-to-b from-white to-primary-dark/5"
    >
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={transition}
          className="relative flex min-h-64 flex-col items-center justify-center overflow-hidden rounded-3xl border border-white/10 px-6 py-12 text-center text-white shadow-soft-lg sm:px-10 md:py-20"
        >
          {/* Background image */}
          <img
            src={ctaImg}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
          <div className="relative z-10 mx-auto max-w-xl">
            <p className="badge-soft mb-4 text-emerald-200/90">Get Started</p>
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              Ready to cultivate your future?
            </h2>
            <p className="mt-4 max-w-md text-sm text-emerald-100/80 md:text-base">
              Join thousands of forward-thinking agricultural professionals
              today. Free onboarding for new farmers.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                className="px-7 text-sm font-semibold md:text-base"
              >
                Create Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-emerald-200/60 bg-transparent text-emerald-100 hover:bg-emerald-100/10"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
