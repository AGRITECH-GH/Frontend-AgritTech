const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => { if (isDev) console.log(...args); },
  warn: (...args) => { if (isDev) console.warn(...args); },
  // Errors always surface — in prod, Sentry picks these up
  error: (...args) => console.error(...args),
};
