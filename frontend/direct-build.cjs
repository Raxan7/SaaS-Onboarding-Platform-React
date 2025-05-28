// This is a custom build script that patches Node's crypto module
// before running the Vite build process
const crypto = require('crypto');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Patch the crypto module
if (!crypto.getRandomValues) {
  crypto.getRandomValues = function(array) {
    return crypto.randomFillSync(array);
  };
}

// Extend the global object to have crypto
if (typeof global !== 'undefined') {
  if (!global.crypto) {
    global.crypto = {};
  }
  if (!global.crypto.getRandomValues) {
    global.crypto.getRandomValues = crypto.getRandomValues;
  }
}

console.log('✅ Crypto patched successfully!');

try {
  // Run the build directly
  console.log('🚀 Running Vite build...');
  execSync('vite build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
  
  // Copy _redirects file for SPA routing support
  const publicRedirects = path.join(__dirname, 'public', '_redirects');
  const distRedirects = path.join(__dirname, 'dist', '_redirects');
  
  if (fs.existsSync(publicRedirects)) {
    console.log('📄 Copying _redirects file for SPA routing...');
    fs.copyFileSync(publicRedirects, distRedirects);
    console.log('✅ _redirects file copied successfully!');
  } else {
    console.warn('⚠️  Warning: _redirects file not found in public directory');
  }
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
