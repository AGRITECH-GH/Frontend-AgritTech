/**
 * RegionalFocusCard – full-bleed background image card with an overlay,
 * badge, title, description and a CTA button.
 *
 * @param {{
 *   badge: string,
 *   title: string,
 *   description: string,
 *   imageUrl: string,
 *   onReview: () => void
 * }} props
 */
const RegionalFocusCard = ({
  badge,
  title,
  description,
  imageUrl,
  onReview,
}) => (
  <div
    className="relative flex flex-col justify-end overflow-hidden rounded-2xl shadow-sm"
    style={{ minHeight: 280 }}
  >
    {/* Background image */}
    <img
      src={imageUrl}
      alt="Regional focus"
      className="absolute inset-0 h-full w-full object-cover"
    />

    {/* Dark gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

    {/* Content */}
    <div className="relative p-6">
      <span className="mb-3 inline-block rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
        {badge}
      </span>
      <h3 className="mb-2 text-xl font-bold leading-snug text-white">
        {title}
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-white/80">
        {description}
      </p>
      <button
        type="button"
        onClick={onReview}
        className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-foreground transition-opacity hover:opacity-90"
      >
        Review Region Data
      </button>
    </div>
  </div>
);

export default RegionalFocusCard;
