import { Sun } from "lucide-react";

/**
 * WeatherWidget – compact weather display for the dashboard header.
 *
 * @param {{ temp: number, condition: string }} props
 */
const WeatherWidget = ({ temp, condition }) => (
  <div className="flex shrink-0 items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm">
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-50">
      <Sun className="h-5 w-5 text-yellow-500" />
    </span>
    <div>
      <p className="text-xs font-medium text-muted">Current Weather</p>
      <p className="text-base font-bold text-foreground">
        {temp}&deg;C &bull; {condition}
      </p>
    </div>
  </div>
);

export default WeatherWidget;
