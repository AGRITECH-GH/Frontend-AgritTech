import {
  TrendingUp,
  TrendingDown,
  Minus,
  MoreVertical,
  Wheat,
  Carrot,
  LeafyGreen,
} from "lucide-react";

const trendConfig = {
  up: {
    Icon: TrendingUp,
    colorClass: "text-green-600",
    bgClass: "bg-green-50",
  },
  down: {
    Icon: TrendingDown,
    colorClass: "text-red-500",
    bgClass: "bg-red-50",
  },
  stable: {
    Icon: Minus,
    colorClass: "text-gray-500",
    bgClass: "bg-gray-100",
  },
};

/** Fallback product icon based on index (replace with real images via imageUrl) */
const productIcons = [Carrot, LeafyGreen, Wheat];

/**
 * ActiveProductsTable – lists the farmer's active product listings.
 *
 * @param {{ products: Array, onViewAll: () => void }} props
 */
const ActiveProductsTable = ({ products, onViewAll }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    {/* Header */}
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-bold text-foreground">Active Products</h2>
      <button
        type="button"
        onClick={onViewAll}
        className="text-sm font-medium text-primary hover:underline"
      >
        View All
      </button>
    </div>

    {/* Column headings */}
    <div className="mb-2 grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 px-1 text-xs font-semibold uppercase tracking-wide text-muted">
      <span>Product</span>
      <span>Stock</span>
      <span>Price</span>
      <span>Trend</span>
      <span />
    </div>

    {/* Rows */}
    <div className="divide-y divide-border/60">
      {products.map((product, idx) => {
        const {
          Icon: TrendIcon,
          colorClass,
          bgClass,
        } = trendConfig[product.trendDir] ?? trendConfig.stable;
        const ProductIcon = productIcons[idx % productIcons.length];

        return (
          <div
            key={product.id}
            className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] items-center gap-2 py-3 px-1"
          >
            {/* Product name + icon */}
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-7 w-7 rounded object-cover"
                  />
                ) : (
                  <ProductIcon className="h-4 w-4 text-primary" />
                )}
              </span>
              <span className="truncate text-sm font-medium text-foreground">
                {product.name}
              </span>
            </div>

            {/* Stock */}
            <span className="text-sm text-muted">{product.stock}</span>

            {/* Price */}
            <span className="text-sm font-semibold text-foreground">
              {product.price}
            </span>

            {/* Trend */}
            <span
              className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${bgClass} ${colorClass}`}
            >
              <TrendIcon className="h-3 w-3" />
              {product.trend}
            </span>

            {/* Actions */}
            <button
              type="button"
              className="rounded-full p-1 text-muted/60 hover:bg-surface hover:text-foreground"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  </div>
);

export default ActiveProductsTable;
