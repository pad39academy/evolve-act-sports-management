// Simple Windows setup without requiring psql command
import { loadEnv } from './load-env.js';
import { exec } from 'child_process';

loadEnv();

console.log('================================================');
console.log('   Simple Windows Setup for Evolve Act');
console.log('================================================');
console.log('');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is missing from .env file');
  console.error('');
  console.error('Please add this to your .env file:');
  console.error('DATABASE_URL=postgresql://postgres:your_password@localhost:5432/evolve_act_sports');
  console.error('');
  console.error('Replace "your_password" with your PostgreSQL password');
  process.exit(1);
}

console.log('🎯 Setting up database schema...');
console.log('');

// Skip psql checks, go directly to schema setup
const schemaCommand = 'npm run db:push';

exec(schemaCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Database schema setup failed:');
    console.error(error.message);
    console.error('');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Connection refused - PostgreSQL is not running');
      console.error('');
      console.error('🔧 To start PostgreSQL on Windows:');
      console.error('1. Open Services (Win+R, type: services.msc)');
      console.error('2. Find "postgresql-x64-XX" service');
      console.error('3. Right-click → Start');
      console.error('');
      console.error('Or use command line:');
      console.error('net start postgresql-x64-14');
    } else if (error.message.includes('authentication failed')) {
      console.error('💡 Authentication failed - Check your password');
      console.error('');
      console.error('Update your .env file with correct password:');
      console.error('DATABASE_URL=postgresql://postgres:correct_password@localhost:5432/evolve_act_sports');
    } else if (error.message.includes('does not exist')) {
      console.error('💡 Database does not exist');
      console.error('');
      console.error('Create the database manually:');
      console.error('1. Open pgAdmin (PostgreSQL admin tool)');
      console.error('2. Connect to your PostgreSQL server');
      console.error('3. Right-click "Databases" → Create → Database');
      console.error('4. Name: evolve_act_sports');
      console.error('5. Save');
    }
    
    process.exit(1);
  }
  
  console.log('✅ Database schema setup completed!');
  console.log('');
  
  // Now populate sample data
  console.log('🚀 Populating sample data...');
  console.log('');
  
  const populateCommand = 'npx tsx server/populateSampleData.ts';
  
  exec(populateCommand, { 
    env: { ...process.env, NODE_ENV: 'development' } 
  }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Sample data population failed:');
      console.error(error.message);
      process.exit(1);
    }
    
    console.log('✅ Sample data populated successfully!');
    console.log('');
    console.log('================================================');
    console.log('   Setup completed successfully!');
    console.log('================================================');
    console.log('');
    console.log('🎉 Your application is ready!');
    console.log('');
    console.log('To start the application:');
    console.log('  npm run dev');
    console.log('');
    console.log('Then open: http://localhost:5000');
    console.log('');
    console.log('Test with these credentials:');
    console.log('  Team Manager: karthik.venkatesan@example.com');
    console.log('  Hotel Manager: anand.sundaram@example.com');
    console.log('  Password: Test@123');
    console.log('');
  });
});