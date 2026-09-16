const timestamp = () => new Date().toISOString();

export const logger = {
  info: (...args) => console.log(`[${timestamp()}] INFO`, ...args),
  warn: (...args) => console.warn(`[${timestamp()}] WARN`, ...args),
  error: (...args) => console.error(`[${timestamp()}] ERROR`, ...args),
  debug: (...args) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[${timestamp()}] DEBUG`, ...args);
    }
  },
};
