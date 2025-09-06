const { execSync } = require('child_process');
const path = require('path');

// Change to models directory
const modelsDir = path.join(__dirname, 'packages', 'models');
process.chdir(modelsDir);

console.log('Setting up database...');

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Push schema to database (creates tables)
  console.log('Pushing schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit' });
  
  console.log('Database setup complete!');
} catch (error) {
  console.error('Database setup failed:', error.message);
  process.exit(1);
}
