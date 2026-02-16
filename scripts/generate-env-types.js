#!/usr/bin/env node

/**
 * Generate TypeScript definitions for environment variables
 * This script reads .env.example and generates type definitions
 * to prevent runtime crashes due to missing environment variables
 */

const fs = require('fs');
const path = require('path');

// Paths
const envExamplePath = path.join(__dirname, '../.env.example');
const outputPath = path.join(__dirname, '../vite-env.d.ts');

// Read .env.example file
function parseEnvFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`Error: ${filePath} not found`);
        process.exit(1);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const envVars = {};

    lines.forEach(line => {
        const trimmed = line.trim();

        // Skip comments and empty lines
        if (!trimmed || trimmed.startsWith('#')) {
            return;
        }

        // Parse KEY=VALUE or KEY=
        const match = trimmed.match(/^([A-Z_][A-Z0-9_]*)=/);
        if (match) {
            const key = match[1];
            envVars[key] = true;
        }
    });

    return Object.keys(envVars);
}

// Generate TypeScript definitions
function generateTypeDefinitions(envVars) {
    const viteVars = envVars.filter(key => key.startsWith('VITE_'));
    const reactVars = envVars.filter(key => key.startsWith('REACT_APP_'));
    const otherVars = envVars.filter(key =>
        !key.startsWith('VITE_') && !key.startsWith('REACT_APP_')
    );

    let output = `/// <reference types="vite/client" />

/**
 * Auto-generated environment variable type definitions
 * Generated from .env.example
 * DO NOT EDIT MANUALLY - Run 'npm run generate:env-types' to regenerate
 */

interface ImportMetaEnv {
`;

    // Add Vite variables (accessible via import.meta.env)
    viteVars.forEach(key => {
        output += `  readonly ${key}: string;\n`;
    });

    output += `}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

`;

    // Add process.env types for React App variables
    if (reactVars.length > 0 || otherVars.length > 0) {
        output += `declare namespace NodeJS {
  interface ProcessEnv {
`;

        [...reactVars, ...otherVars].forEach(key => {
            output += `    readonly ${key}?: string;\n`;
        });

        output += `  }
}

`;
    }

    output += `// Helper type for environment variable validation
export type RequiredEnvVars = ${viteVars.map(key => `'${key}'`).join(' | ')};

// Runtime validation helper
export function validateEnv(): void {
  const required: RequiredEnvVars[] = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      \`Missing required environment variables: \${missing.join(', ')}\\n\` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }
}
`;

    return output;
}

// Main execution
try {
    console.log('🔍 Reading .env.example...');
    const envVars = parseEnvFile(envExamplePath);

    console.log(`✅ Found ${envVars.length} environment variables`);

    console.log('📝 Generating TypeScript definitions...');
    const typeDefinitions = generateTypeDefinitions(envVars);

    console.log(`💾 Writing to ${outputPath}...`);
    fs.writeFileSync(outputPath, typeDefinitions, 'utf-8');

    console.log('✨ Environment type definitions generated successfully!');
    console.log(`   Output: ${path.relative(process.cwd(), outputPath)}`);
} catch (error) {
    console.error('❌ Error generating environment types:', error.message);
    process.exit(1);
}
