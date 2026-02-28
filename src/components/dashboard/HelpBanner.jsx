import { Phone, BookOpen } from "lucide-react";

/**
 * HelpBanner – sticky CTA at the bottom of the dashboard encouraging
 * farmers to reach an agent or visit the knowledge base.
 *
 * @param {{ onCallAgent: () => void, onKnowledgeBase: () => void }} props
 */
const HelpBanner = ({ onCallAgent, onKnowledgeBase }) => (
  <div className="flex flex-col gap-4 rounded-2xl bg-foreground px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
    <div className="max-w-xs">
      <h3 className="text-base font-bold text-white">
        Need Help with your Listings?
      </h3>
      <p className="mt-1 text-sm text-white/60">
        Our dedicated agricultural agents are available to help you list your
        products or manage your barter offers.
      </p>
    </div>

    <div className="flex shrink-0 gap-3">
      <button
        type="button"
        onClick={onCallAgent}
        className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
      >
        <Phone className="h-4 w-4" />
        Call Agent
      </button>
      <button
        type="button"
        onClick={onKnowledgeBase}
        className="flex items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
      >
        <BookOpen className="h-4 w-4" />
        Knowledge Base
      </button>
    </div>
  </div>
);

export default HelpBanner;
