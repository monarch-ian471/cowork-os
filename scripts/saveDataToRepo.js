#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);

if (argv.length === 0) {
  console.error('Usage: node scripts/saveDataToRepo.js <path-to-json> [--dest <path>] [--force]');
  process.exit(1);
}

const srcPath = path.resolve(process.cwd(), argv[0]);
let destFlagIndex = argv.indexOf('--dest');
let destPath = destFlagIndex > -1 && argv[destFlagIndex + 1] ? path.resolve(process.cwd(), argv[destFlagIndex + 1]) : path.resolve(process.cwd(), 'public', 'data.json');
const force = argv.includes('--force');

if (process.env.NODE_ENV !== 'development' && !force) {
  console.error('This script should be run in a development environment only. Set NODE_ENV=development or pass --force to override.');
  process.exit(1);
}

try {
  const content = fs.readFileSync(srcPath, 'utf-8');
  const json = JSON.parse(content);
  fs.writeFileSync(destPath, JSON.stringify(json, null, 2), 'utf-8');
  console.log(`Wrote seed data to ${destPath}`);
} catch (err) {
  console.error('Failed to write seed file:', err.message);
  process.exit(1);
}