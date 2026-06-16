const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const reducedMotion = prefersReduced;

export const transition = {
  duration: prefersReduced ? 0 : 0.6,
  ease: "easeOut",
};

export const fadeInUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { ...transition, delay },
});

export const staggerContainer = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ...transition,
      staggerChildren: prefersReduced ? 0 : 0.12,
    },
  },
};

export const fadeFromDirection = (direction = "up", delay = 0) => {
  const distance = 32;
  const axis =
    direction === "left" || direction === "right"
      ? { x: direction === "left" ? -distance : distance }
      : { y: direction === "up" ? distance : -distance };

  return {
    initial: { opacity: 0, ...axis },
    whileInView: { opacity: 1, x: 0, y: 0 },
    viewport: { once: true, amount: 0.25 },
    transition: { ...transition, delay },
  };
};

