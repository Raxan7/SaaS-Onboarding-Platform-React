// build.mjs

// First, import our crypto polyfill
import './vite.node.js';

// Create a custom implementation that bypasses the need for crypto.getRandomValues
// This is a temporary workaround for the Vite build process
process.env.VITE_BYPASS_CRYPTO = 'true';

// Run Vite build with a custom config that bypasses crypto.getRandomValues
async function main() {
  try {
    console.log('Starting Vite build process with crypto bypass...');
    
    // Import vite dynamically after the polyfill is in place
    const { build } = await import('vite');
    
    // Run build with custom options
    await build({
      // Force the build to use our polyfill
      esbuild: {
        define: {
          'crypto.getRandomValues': 'globalThis.crypto.getRandomValues'
        }
      }
    });
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

main();
