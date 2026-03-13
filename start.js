/**
 * Wrapper entry point for Render.
 * ESM imports are hoisted and cannot be wrapped in try-catch,
 * so we use dynamic import to catch startup errors.
 */
import { existsSync } from 'fs';

// Pre-flight check: ensure server deps are installed
if (!existsSync('./server/node_modules/express')) {
    console.error('Server dependencies missing! Running npm ci --prefix server ...');
    const { execSync } = await import('child_process');
    try {
        execSync('npm ci --prefix server', { stdio: 'inherit' });
    } catch {
        console.error('Failed to install server dependencies.');
        process.exit(1);
    }
}

try {
    await import('./server/server.js');
} catch (err) {
    console.error('=== SERVER FAILED TO START ===');
    console.error(err);
    process.exit(1);
}
