#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Move files from dist/public to dist root for static deployment
const publicDir = path.join(__dirname, 'dist', 'public');
const distDir = path.join(__dirname, 'dist');

if (fs.existsSync(publicDir)) {
  console.log('Fixing deployment structure...');
  
  // Read all files in public directory
  const files = fs.readdirSync(publicDir, { withFileTypes: true });
  
  for (const file of files) {
    const srcPath = path.join(publicDir, file.name);
    const destPath = path.join(distDir, file.name);
    
    if (file.isDirectory()) {
      // Copy directory recursively
      fs.cpSync(srcPath, destPath, { recursive: true });
      fs.rmSync(srcPath, { recursive: true });
    } else {
      // Move file to dist root
      fs.renameSync(srcPath, destPath);
    }
    console.log(`Moved ${file.name}`);
  }
  
  // Remove empty public directory
  fs.rmdirSync(publicDir);
  console.log('✓ Build structure fixed for deployment');
} else {
  console.log('No dist/public directory found - build structure already correct');
}