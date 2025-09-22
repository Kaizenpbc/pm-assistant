#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting PM Application with Auto-Restart...\n');

// Kill any existing processes
const killExisting = () => {
  return new Promise((resolve) => {
    const { exec } = require('child_process');
    exec('taskkill /F /IM node.exe 2>nul || echo "No processes to kill"', (error) => {
      resolve();
    });
  });
};

// Start development servers
const startDev = async () => {
  await killExisting();
  
  console.log('📦 Installing dependencies if needed...');
  
  // Start both servers with enhanced logging
  const server = spawn('npm', ['run', 'server:dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  const client = spawn('npm', ['run', 'client:dev'], {
    stdio: 'inherit', 
    shell: true,
    cwd: path.join(process.cwd(), 'src/client')
  });

  // Handle process cleanup
  const cleanup = () => {
    console.log('\n🛑 Shutting down servers...');
    server.kill('SIGTERM');
    client.kill('SIGTERM');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);

  // Handle server crashes
  server.on('exit', (code) => {
    if (code !== 0) {
      console.log('💥 Server crashed, restarting in 2 seconds...');
      setTimeout(() => {
        startDev();
      }, 2000);
    }
  });

  client.on('exit', (code) => {
    if (code !== 0) {
      console.log('💥 Client crashed, restarting in 2 seconds...');
      setTimeout(() => {
        startDev();
      }, 2000);
    }
  });
};

startDev();
