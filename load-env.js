// Load environment variables from .env file
import { readFileSync } from 'fs';

export function loadEnv() {
  try {
    const envContent = readFileSync('.env', 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    }
    
    console.log('✅ Environment variables loaded from .env file');
    console.log('Database URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('Session Secret:', process.env.SESSION_SECRET ? '✅ Set' : '❌ Missing');
    console.log('');
  } catch (error) {
    console.error('❌ Error loading .env file:', error.message);
    console.error('Please make sure .env file exists with DATABASE_URL and SESSION_SECRET');
    process.exit(1);
  }
}