const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
const env = dotenv.config().parsed;

// Create environment.ts file
const environmentFileContent = `export const environment = {
  production: false,
  supabaseUrl: '${env.NG_APP_SUPABASE_URL || ''}',
  supabaseKey: '${env.NG_APP_SUPABASE_KEY || ''}',
  openaiApiKey: '${env.NG_APP_OPENAI_API_KEY || ''}'
};`;

// Create environment.prod.ts file
const environmentProdFileContent = `export const environment = {
  production: true,
  supabaseUrl: '${env.NG_APP_SUPABASE_URL || ''}',
  supabaseKey: '${env.NG_APP_SUPABASE_KEY || ''}',
  openaiApiKey: '${env.NG_APP_OPENAI_API_KEY || ''}'
};`;

// Ensure environments directory exists
const envDir = path.join(__dirname, '../src/environments');
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir);
}

// Write the files
fs.writeFileSync(path.join(envDir, 'environment.ts'), environmentFileContent);
fs.writeFileSync(path.join(envDir, 'environment.prod.ts'), environmentProdFileContent);

console.log('Environment files generated successfully.');