import pino from 'pino';

const IS_PROD = process.env.NODE_ENV === 'production';

const logger = pino({ level: IS_PROD ? 'info' : 'debug' });

export default logger;
