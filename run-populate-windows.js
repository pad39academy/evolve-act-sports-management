// Windows-compatible script to run populate sample data
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variable and run the populate script
process.env.NODE_ENV = 'development';

const command = `tsx "${join(__dirname, 'server', 'populateSampleData.ts')}"`;

console.log('Running populate sample data...');
console.log('Command:', command);

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  if (stderr) {
    console.error('Stderr:', stderr);
  }
  
  console.log('Output:', stdout);
});