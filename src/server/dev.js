const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting PM Application with Auto-Restart...');

// Start the TypeScript compiler in watch mode
const tsc = spawn('npx', ['tsc', '--watch', '--preserveWatchOutput'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Start the server with nodemon
const server = spawn('npx', ['nodemon', 'dist/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down servers...');
  tsc.kill();
  server.kill();
  process.exit(0);
});

// Handle errors
tsc.on('error', (err) => {
  console.error('❌ TypeScript compiler error:', err);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

console.log('✅ Development servers started successfully!');
console.log('📝 TypeScript compiler running in watch mode');
console.log('🔄 Server will auto-restart on changes');
console.log('🌐 Server will be available at http://localhost:3001');
console.log('📊 Health API available at http://localhost:3001/api/v1/health/1');
console.log('\nPress Ctrl+C to stop all servers');
