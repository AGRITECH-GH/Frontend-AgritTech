export function cn(...values) {
  return values
    .flatMap((v) => {
      if (!v) return [];
      if (typeof v === "string") return v.split(" ");
      if (Array.isArray(v)) return v;
      if (typeof v === "object") {
        return Object.entries(v)
          .filter(([, condition]) => Boolean(condition))
          .map(([className]) => className);
      }
      return [];
    })
    .join(" ")
    .trim();
}

