// Database setup script for Windows
import { loadEnv } from './load-env.js';
import { exec } from 'child_process';

loadEnv();

console.log('================================================');
console.log('   Database Setup for Windows');
console.log('================================================');
console.log('');

// Parse the database URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL is missing from .env file');
  console.error('Please add DATABASE_URL to your .env file');
  process.exit(1);
}

// Extract database details
const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (!urlMatch) {
  console.error('❌ Invalid DATABASE_URL format');
  console.error('Expected: postgresql://username:password@host:port/database');
  process.exit(1);
}

const [, username, password, host, port, database] = urlMatch;

console.log('🔍 Database Configuration:');
console.log(`   Host: ${host}`);
console.log(`   Port: ${port}`);
console.log(`   Username: ${username}`);
console.log(`   Database: ${database}`);
console.log('');

// Check if PostgreSQL is running
console.log('🔍 Checking PostgreSQL connection...');

const checkCommand = `psql -h ${host} -p ${port} -U ${username} -c "SELECT version();" -d postgres`;

exec(checkCommand, { 
  env: { ...process.env, PGPASSWORD: password } 
}, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ PostgreSQL connection failed:');
    console.error(error.message);
    console.error('');
    console.error('💡 Please ensure:');
    console.error('1. PostgreSQL is installed and running');
    console.error('2. PostgreSQL service is started');
    console.error('3. Username and password are correct');
    console.error('4. PostgreSQL is listening on the specified host and port');
    console.error('');
    console.error('🔧 To start PostgreSQL on Windows:');
    console.error('   - Open Services (services.msc)');
    console.error('   - Find "postgresql-x64-XX" service');
    console.error('   - Right-click → Start');
    console.error('');
    console.error('🔧 Or use command line:');
    console.error('   net start postgresql-x64-14');
    process.exit(1);
  }
  
  console.log('✅ PostgreSQL is running and accessible');
  console.log('');
  
  // Create database if it doesn't exist
  console.log(`🚀 Creating database: ${database}`);
  
  const createDbCommand = `psql -h ${host} -p ${port} -U ${username} -c "CREATE DATABASE ${database};" -d postgres`;
  
  exec(createDbCommand, { 
    env: { ...process.env, PGPASSWORD: password } 
  }, (error, stdout, stderr) => {
    if (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Database already exists');
      } else {
        console.error('❌ Failed to create database:');
        console.error(error.message);
        process.exit(1);
      }
    } else {
      console.log('✅ Database created successfully');
    }
    
    console.log('');
    console.log('🎯 Setting up database schema...');
    
    // Run database migration
    const migrateCommand = 'npm run db:push';
    
    exec(migrateCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Database schema setup failed:');
        console.error(error.message);
        process.exit(1);
      }
      
      console.log('✅ Database schema setup completed');
      console.log('');
      console.log('================================================');
      console.log('   Database setup completed successfully!');
      console.log('================================================');
      console.log('');
      console.log('🎉 Next steps:');
      console.log('1. Run: node populate-with-env.js');
      console.log('2. Run: npm run dev');
      console.log('3. Open: http://localhost:5000');
      console.log('');
    });
  });
});