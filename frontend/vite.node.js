// More aggressive polyfill for crypto in Node.js environment
import crypto from 'crypto';

// Create a complete Web Crypto API compatible polyfill
const webCrypto = {
  getRandomValues: function(typedArray) {
    const bytes = crypto.randomBytes(typedArray.length);
    for (let i = 0; i < typedArray.length; i++) {
      typedArray[i] = bytes[i];
    }
    return typedArray;
  },
  // Add other crypto methods as needed
  subtle: crypto.subtle || {}
};

// Apply to globalThis
globalThis.crypto = webCrypto;

// Also patch global object if it exists
if (typeof global !== 'undefined') {
  global.crypto = webCrypto;
}

// Monkey patch Node's crypto to ensure it has getRandomValues for importers that directly use it
crypto.getRandomValues = webCrypto.getRandomValues;

console.log('Enhanced crypto polyfill installed successfully');
