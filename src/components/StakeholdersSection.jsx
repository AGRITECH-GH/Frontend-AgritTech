import { motion } from "framer-motion";
import farmersImg from "@/assets/farmer.jpg";
import agentsImg from "@/assets/agent.jpg";
import buyersImg from "@/assets/buyer.jpg";
import { fadeInUp, staggerContainer } from "@/motionConfig";
import { ArrowRight, Tractor, Network, ShoppingBasket } from "lucide-react";

const cards = [
  {
    title: "For Farmers",
    description:
      "Optimize yields with precision data, soil health analytics, and real-time disease monitoring tools.",
    img: farmersImg,
    Icon: Tractor,
  },
  {
    title: "For Agents",
    description:
      "Connect high-quality producers with global markets through automated logistics and smart contracts.",
    img: agentsImg,
    Icon: Network,
  },
  {
    title: "For Buyers",
    description:
      "Source fresh, traceable produce directly from certified sustainable farms with verified origin data.",
    img: buyersImg,
    Icon: ShoppingBasket,
  },
];

const StakeholdersSection = () => {
  return (
    <section
      id="solutions"
      className="section-padding bg-surface pb-10 md:pb-16"
    >
      <div className="container">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Our Ecosystem
            </p>
            <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Empowering every
              <br />
              stakeholder.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-muted md:mt-1 md:text-base">
            Our platform creates a seamless loop connecting production to
            consumption with transparency and efficiency.
          </p>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="mt-10 grid gap-6 md:grid-cols-3"
        >
          {cards.map((card, index) => {
            const Icon = card.Icon;
            return (
              <motion.article
                key={card.title}
                {...fadeInUp(index * 0.08)}
                className="card-elevated group flex flex-col overflow-hidden"
              >
                {/* Full-bleed image */}
                <div className="-mx-6 -mt-6 mb-5">
                  <img
                    src={card.img}
                    alt={card.title}
                    className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                {/* Icon */}
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-primary shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 font-heading text-lg font-bold text-foreground">
                  {card.title}
                </h3>
                <p className="text-sm text-muted">{card.description}</p>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default StakeholdersSection;
