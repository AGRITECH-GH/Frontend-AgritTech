import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/**
 * ListingActivityChart – bar chart comparing current vs previous week listings.
 *
 * @param {{ data: Array<{ day, current, previous }> }} props
 */
const ListingActivityChart = ({ data }) => (
  <div className="rounded-2xl bg-white p-5 shadow-sm">
    {/* Header */}
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-bold text-foreground">Listing Activity</h2>
      <div className="flex items-center gap-4 text-xs font-medium text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
          Current
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-200" />
          Previous
        </span>
      </div>
    </div>

    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barCategoryGap="30%" barGap={4}>
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#6b7280" }}
        />
        <YAxis hide />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            borderRadius: "0.75rem",
            border: "1px solid #e2e8f0",
            fontSize: 12,
          }}
        />
        <Bar
          dataKey="previous"
          fill="#e5e7eb"
          radius={[4, 4, 0, 0]}
          name="Previous"
        />
        <Bar
          dataKey="current"
          fill="#0FBD3B"
          radius={[4, 4, 0, 0]}
          name="Current"
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default ListingActivityChart;
