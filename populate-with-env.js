// Populate sample data script with environment variable loading
import { loadEnv } from './load-env.js';
import { exec } from 'child_process';

// Load environment variables first
loadEnv();

console.log('================================================');
console.log('   Populating Sample Data for Windows');
console.log('================================================');
console.log('');

// Verify database connection
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing from .env file');
  console.error('Please add DATABASE_URL to your .env file:');
  console.error('DATABASE_URL=postgresql://postgres:your_password@localhost:5432/evolve_act_sports');
  process.exit(1);
}

console.log('🔍 Checking database connection...');
console.log('Database URL format:', process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@'));
console.log('');

// Run the populate script with loaded environment
console.log('🚀 Running sample data population...');
console.log('');

const command = 'npx tsx server/populateSampleData.ts';

exec(command, { 
  env: { ...process.env, NODE_ENV: 'development' } 
}, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error running populate script:');
    console.error(error.message);
    
    // Provide specific guidance based on error type
    if (error.message.includes('DATABASE_URL')) {
      console.error('');
      console.error('💡 Database connection issue:');
      console.error('1. Check if PostgreSQL is running');
      console.error('2. Verify database exists: evolve_act_sports');
      console.error('3. Check username/password in .env file');
      console.error('4. Ensure database is accessible on localhost:5432');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('');
      console.error('💡 Connection refused:');
      console.error('1. Start PostgreSQL service');
      console.error('2. Check if port 5432 is available');
      console.error('3. Verify PostgreSQL is listening on localhost');
    } else if (error.message.includes('authentication failed')) {
      console.error('');
      console.error('💡 Authentication failed:');
      console.error('1. Check PostgreSQL username and password');
      console.error('2. Verify user has database creation permissions');
    }
    
    process.exit(1);
  }
  
  if (stderr) {
    console.error('⚠️  Warnings:', stderr);
  }
  
  console.log('✅ Success! Output:');
  console.log(stdout);
  console.log('');
  console.log('================================================');
  console.log('   Sample data populated successfully!');
  console.log('================================================');
  console.log('');
  console.log('🎉 You can now test the application with these credentials:');
  console.log('');
  console.log('Team Manager:');
  console.log('  📧 Email: karthik.venkatesan@example.com');
  console.log('  🔑 Password: Test@123');
  console.log('');
  console.log('Hotel Manager:');
  console.log('  📧 Email: anand.sundaram@example.com');
  console.log('  🔑 Password: Test@123');
  console.log('');
  console.log('Event Manager:');
  console.log('  📧 Email: anand.iyer@example.com');
  console.log('  🔑 Password: Test@123');
  console.log('');
  console.log('Player:');
  console.log('  📧 Email: karthik.chidambaram@example.com');
  console.log('  🔑 Password: Test@123');
  console.log('');
  console.log('🌐 Start the application with: npm run dev');
  console.log('📱 Then open: http://localhost:5000');
});