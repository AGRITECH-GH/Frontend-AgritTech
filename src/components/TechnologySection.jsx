import { motion } from "framer-motion";
import innovationImg from "@/assets/Innovation.png";
import { fadeFromDirection, fadeInUp } from "@/motionConfig";
import { Activity, Globe2, Sprout } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Smart Analytics",
    description:
      "Advanced AI-driven insights to maximize every acre and reduce resource waste.",
  },
  {
    icon: Globe2,
    title: "Global Reach",
    description:
      "A unified network connecting stakeholders worldwide with localized intelligence.",
  },
  {
    icon: Sprout,
    title: "Sustainable Growth",
    description:
      "Eco-friendly solutions designed for long-term health of our planet and your profits.",
  },
];

const TechnologySection = () => {
  return (
    <section
      id="innovation"
      className="section-padding bg-gradient-to-b from-white via-surface to-white"
    >
      <div className="container grid gap-12 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-center">
        <motion.div {...fadeFromDirection("left")}>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Our Technology
          </p>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Bridging traditional wisdom with modern innovation.
          </h2>

          <div className="mt-10 flex flex-col gap-7">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  {...fadeInUp(0.15 + index * 0.08)}
                  className="flex items-start gap-5"
                >
                  <div className="shrink-0 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm border border-emerald-100/60">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-base font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          {...fadeFromDirection("right", 0.15)}
          className="overflow-hidden rounded-3xl"
        >
          <img
            src={innovationImg}
            alt="Smart farming dashboard"
            className="h-full w-full object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default TechnologySection;
