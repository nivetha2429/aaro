/**
 * Validate required environment variables at startup.
 * Exits the process if any critical vars are missing.
 */
const required = ['JWT_SECRET', 'MONGODB_URI'];
const optional = ['PORT', 'NODE_ENV', 'ALLOWED_ORIGINS'];

export function validateEnv() {
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        process.stderr.write(`\nFATAL: Missing required env vars: ${missing.join(', ')}\n`);
        process.stderr.write('Create a .env file or set them in your environment.\n\n');
        process.exit(1);
    }

    // Warn about optional but recommended vars
    const warnings = [];
    if (!process.env.NODE_ENV) warnings.push('NODE_ENV not set — defaulting to development');
    if (!process.env.ALLOWED_ORIGINS && process.env.NODE_ENV === 'production') {
        warnings.push('ALLOWED_ORIGINS not set — using default origins (aarogroups.com)');
    }
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        warnings.push('JWT_SECRET is too short — use at least 32 characters');
    }

    if (warnings.length > 0) {
        warnings.forEach(w => process.stderr.write(`WARNING: ${w}\n`));
    }

    return { warnings };
}
