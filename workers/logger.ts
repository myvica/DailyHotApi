const logger = {
  info: (message: string) => {
    console.log(`[INFO] ${message}`);
  },
  warn: (message: string) => {
    console.warn(`[WARN] ${message}`);
  },
  error: (message: string | Error) => {
    if (message instanceof Error) {
      console.error(`[ERROR] ${message.message}`, message.stack);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
  debug: (message: string) => {
    console.debug(`[DEBUG] ${message}`);
  },
};

export default logger;
