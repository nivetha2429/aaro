/**
 * Wrapper entry point for Render.
 * ESM imports are hoisted and cannot be wrapped in try-catch,
 * so we use dynamic import to catch startup errors.
 */
try {
    await import('./server/server.js');
} catch (err) {
    console.error('=== SERVER FAILED TO START ===');
    console.error(err);
    process.exit(1);
}
