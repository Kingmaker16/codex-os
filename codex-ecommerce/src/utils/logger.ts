/**
 * E-Commerce Engine v2 - Logger
 * Structured logging for e-commerce operations
 */

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[ECOMM INFO] ${message}`, meta || '');
  },
  
  error: (message: string, error?: any) => {
    console.error(`[ECOMM ERROR] ${message}`, error || '');
  },
  
  warn: (message: string, meta?: any) => {
    console.warn(`[ECOMM WARN] ${message}`, meta || '');
  },
  
  debug: (message: string, meta?: any) => {
    if (process.env.DEBUG) {
      console.log(`[ECOMM DEBUG] ${message}`, meta || '');
    }
  }
};

export default logger;
