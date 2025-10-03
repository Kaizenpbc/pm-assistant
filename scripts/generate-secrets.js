#!/usr/bin/env node

/**
 * PM Application v2 - Secure Secret Generator
 * 
 * This script generates cryptographically secure secrets for JWT tokens and cookies
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class SecretGenerator {
  constructor() {
    this.secrets = {};
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  generateSecret(name, length = 32) {
    const secret = crypto.randomBytes(length).toString('base64');
    this.secrets[name] = secret;
    return secret;
  }

  generateAllSecrets() {
    this.log('🔐 Generating cryptographically secure secrets...', 'bright');
    this.log('=' .repeat(50), 'blue');

    // Generate secrets
    this.generateSecret('JWT_SECRET', 32);
    this.generateSecret('JWT_REFRESH_SECRET', 32);
    this.generateSecret('COOKIE_SECRET', 32);

    return this.secrets;
  }

  displaySecrets() {
    this.log('\n📋 Generated Secrets:', 'cyan');
    this.log('-'.repeat(40), 'blue');

    Object.entries(this.secrets).forEach(([name, value]) => {
      this.log(`${name}=${value}`, 'green');
    });

    this.log('-'.repeat(40), 'blue');
    this.log(`Total secrets generated: ${Object.keys(this.secrets).length}`, 'cyan');
  }

  generateEnvFile(templatePath, outputPath) {
    if (!fs.existsSync(templatePath)) {
      this.log(`❌ Template file not found: ${templatePath}`, 'red');
      return false;
    }

    try {
      let content = fs.readFileSync(templatePath, 'utf8');

      // Replace placeholder secrets with generated ones
      Object.entries(this.secrets).forEach(([name, value]) => {
        const placeholder = `PLACEHOLDER_GENERATE_REAL_SECRET_WITH_NPM_RUN_CONFIG_GENERATE_SECRETS`;
        // Replace only the first occurrence for each secret
        content = content.replace(placeholder, value);
      });

      fs.writeFileSync(outputPath, content);
      this.log(`✅ Generated environment file: ${outputPath}`, 'green');
      return true;
    } catch (error) {
      this.log(`❌ Failed to generate environment file: ${error.message}`, 'red');
      return false;
    }
  }

  showUsage() {
    this.log('\n💡 Usage Instructions:', 'yellow');
    this.log('1. Copy the generated secrets above to your .env file', 'cyan');
    this.log('2. Or run with --generate-env to create a complete .env file', 'cyan');
    this.log('3. Never commit secrets to version control', 'red');
    this.log('4. Use different secrets for each environment (dev, staging, prod)', 'yellow');
  }

  showSecurityTips() {
    this.log('\n🛡️ Security Tips:', 'magenta');
    this.log('• Use at least 32 characters for all secrets', 'cyan');
    this.log('• Use different secrets for each environment', 'cyan');
    this.log('• Rotate secrets regularly in production', 'cyan');
    this.log('• Store production secrets in secure key management systems', 'cyan');
    this.log('• Never log or expose secrets in error messages', 'cyan');
  }

  run(options = {}) {
    this.generateAllSecrets();
    this.displaySecrets();

    if (options.generateEnv) {
      this.log('\n📝 Generating .env file...', 'cyan');
      const templatePath = 'config-templates/development.env.template';
      const outputPath = '.env';
      
      if (this.generateEnvFile(templatePath, outputPath)) {
        this.log('✅ Complete .env file generated!', 'green');
      }
    }

    this.showUsage();
    this.showSecurityTips();

    this.log('\n🎉 Secret generation complete!', 'green');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  generateEnv: args.includes('--generate-env') || args.includes('-e'),
  help: args.includes('--help') || args.includes('-h')
};

if (options.help) {
  console.log(`
PM Application v2 - Secret Generator

Usage: node scripts/generate-secrets.js [options]

Options:
  --generate-env, -e    Generate a complete .env file with the secrets
  --help, -h           Show this help message

Examples:
  node scripts/generate-secrets.js                    # Just generate secrets
  node scripts/generate-secrets.js --generate-env     # Generate secrets and .env file
`);
  process.exit(0);
}

// Run the generator
const generator = new SecretGenerator();
generator.run(options);
