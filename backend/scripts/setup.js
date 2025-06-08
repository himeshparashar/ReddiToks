#!/usr/bin/env node

/**
 * Development setup script
 * Creates necessary directories and files for development
 */

const fs = require("fs");
const path = require("path");

const requiredDirs = [
  "./temp",
  "./public",
  "./public/videos",
  "./public/audio",
  "./logs",
];

const requiredFiles = [{ path: "./.env", template: "./.env.example" }];

console.log("🚀 Setting up ReddiToks Backend development environment...\n");

// Create directories
requiredDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`ℹ️  Directory already exists: ${dir}`);
  }
});

// Create files from templates
requiredFiles.forEach((file) => {
  if (!fs.existsSync(file.path)) {
    if (fs.existsSync(file.template)) {
      fs.copyFileSync(file.template, file.path);
      console.log(`✅ Created file: ${file.path} from ${file.template}`);
    } else {
      console.log(`⚠️  Template not found: ${file.template}`);
    }
  } else {
    console.log(`ℹ️  File already exists: ${file.path}`);
  }
});

console.log("\n🎉 Setup complete!");
console.log("\n📝 Next steps:");
console.log("1. Edit .env file with your API keys");
console.log("2. Run: npm install");
console.log("3. Run: npm run dev");
console.log("\n🔗 Documentation: README.md");
