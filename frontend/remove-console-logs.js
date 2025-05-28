#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively find all .ts and .tsx files
function findSourceFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findSourceFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to remove non-error console logs from a file
function removeConsoleLogs(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Remove debug console logs but keep error logs
  const lines = content.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmedLine = line.trim();
    
    // Keep console.error statements
    if (trimmedLine.includes('console.error')) {
      return true;
    }
    
    // Remove other console statements (log, warn, info, debug, etc.)
    if (trimmedLine.includes('console.log') || 
        trimmedLine.includes('console.warn') || 
        trimmedLine.includes('console.info') || 
        trimmedLine.includes('console.debug') ||
        trimmedLine.includes('console.table') ||
        trimmedLine.includes('console.trace')) {
      console.log(`Removing from ${filePath}: ${trimmedLine}`);
      modified = true;
      return false;
    }
    
    return true;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, filteredLines.join('\n'));
    return true;
  }
  
  return false;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const sourceFiles = findSourceFiles(srcDir);

console.log(`Found ${sourceFiles.length} source files to process...`);

let modifiedCount = 0;
for (const file of sourceFiles) {
  if (removeConsoleLogs(file)) {
    modifiedCount++;
  }
}

console.log(`\nCompleted! Modified ${modifiedCount} files.`);
console.log('Kept all console.error statements for production debugging.');
