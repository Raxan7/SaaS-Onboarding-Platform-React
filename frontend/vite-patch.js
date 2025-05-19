// This patch file specifically targets Vite's crypto usage
// It's a more direct approach to fixing the getRandomValues issue
const crypto = require('crypto');

// Direct patch to Node.js crypto module
crypto.getRandomValues = function(array) {
  return crypto.randomFillSync(array);
};

console.log('Vite crypto patch applied');
