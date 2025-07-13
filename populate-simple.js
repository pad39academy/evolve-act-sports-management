// Simple Node.js script to populate sample data (Windows compatible)
import { exec } from 'child_process';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variable
process.env.NODE_ENV = 'development';

console.log('================================================');
console.log('   Populating Sample Data for Windows');
console.log('================================================');
console.log('');

// Check if package.json exists
try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    console.log('Project:', packageJson.name);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('');
} catch (error) {
    console.error('Error reading package.json:', error.message);
    process.exit(1);
}

// Try different ways to run the populate script
const commands = [
    'npx tsx server/populateSampleData.ts',
    'node_modules\\.bin\\tsx server/populateSampleData.ts',
    'node_modules/.bin/tsx server/populateSampleData.ts'
];

let commandIndex = 0;

function tryNextCommand() {
    if (commandIndex >= commands.length) {
        console.error('❌ All commands failed. Please check:');
        console.error('1. Database connection in .env file');
        console.error('2. Node.js and npm are properly installed');
        console.error('3. Dependencies are installed (run: npm install)');
        process.exit(1);
    }

    const command = commands[commandIndex];
    console.log(`Trying command ${commandIndex + 1}: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Command ${commandIndex + 1} failed:`, error.message);
            commandIndex++;
            tryNextCommand();
            return;
        }
        
        if (stderr) {
            console.error('Stderr:', stderr);
        }
        
        console.log('✅ Success! Output:');
        console.log(stdout);
        console.log('');
        console.log('================================================');
        console.log('   Sample data populated successfully!');
        console.log('================================================');
        console.log('');
        console.log('Test credentials:');
        console.log('  Team Manager: karthik.venkatesan@example.com');
        console.log('  Hotel Manager: anand.sundaram@example.com');
        console.log('  Password: Test@123');
        console.log('');
    });
}

tryNextCommand();