const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class MonitoringSetup {
  constructor() {
    this.baseDir = __dirname;
    this.monitoringDir = path.join(this.baseDir, 'monitoring');
    this.reportsDir = path.join(this.baseDir, 'monitoring-reports');
    this.dashboardDir = path.join(this.baseDir, 'monitoring-dashboard');
    this.configDir = path.join(this.baseDir, 'config');
    this.testsDir = path.join(this.baseDir, 'tests', 'resilience');
  }

  async setup() {
    console.log('🚀 Setting up Monitoring & Resilience Testing System');
    console.log('====================================================');

    try {
      await this.createDirectories();
      await this.installDependencies();
      await this.createEnvironmentTemplate();
      await this.createCronJobs();
      await this.createSystemdService();
      await this.createDocumentation();
      
      console.log('\n✅ Monitoring setup completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Configure your environment variables in .env.local');
      console.log('2. Set up email/Slack/Discord webhooks for alerts');
      console.log('3. Run: npm run monitor:start');
      console.log('4. Access dashboard at: monitoring-dashboard/index.html');
      
    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  async createDirectories() {
    console.log('📁 Creating directories...');
    
    const directories = [
      this.monitoringDir,
      this.reportsDir,
      this.dashboardDir,
      this.configDir,
      this.testsDir,
      path.join(this.reportsDir, 'health'),
      path.join(this.reportsDir, 'performance'),
      path.join(this.reportsDir, 'resilience'),
      path.join(this.reportsDir, 'alerts')
    ];

    for (const dir of directories) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`   ✅ Created: ${dir}`);
      } else {
        console.log(`   📁 Exists: ${dir}`);
      }
    }
  }

  async installDependencies() {
    console.log('📦 Installing monitoring dependencies...');
    
    try {
      // Install nodemailer for email alerts
      execSync('npm install nodemailer', { stdio: 'inherit' });
      console.log('   ✅ Installed nodemailer');
    } catch (error) {
      console.log('   ⚠️ Failed to install nodemailer:', error.message);
    }
  }

  async createEnvironmentTemplate() {
    console.log('🔧 Creating environment template...');
    
    const envTemplate = `# Monitoring & Alerting Configuration
# Copy these to your .env.local file and configure

# Email Alerts
ALERT_EMAIL_ENABLED=true
ALERT_EMAIL_FROM=alerts@yourwebsite.com
ALERT_EMAIL_TO=admin@yourwebsite.com,team@yourwebsite.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Slack Alerts
ALERT_SLACK_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Discord Alerts
ALERT_DISCORD_ENABLED=true
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/DISCORD/WEBHOOK

# Monitoring Configuration
MONITORING_INTERVAL=300000
PERFORMANCE_INTERVAL=600000
RESILIENCE_INTERVAL=86400000
DASHBOARD_INTERVAL=1800000

# Alert Thresholds
CRITICAL_RESPONSE_TIME=10000
WARNING_RESPONSE_TIME=5000
CRITICAL_MEMORY_USAGE=0.95
WARNING_MEMORY_USAGE=0.8
CRITICAL_ERROR_RATE=0.1
WARNING_ERROR_RATE=0.05

# Cooldown Periods (in milliseconds)
CRITICAL_ALERT_COOLDOWN=900000
WARNING_ALERT_COOLDOWN=3600000
`;

    const envPath = path.join(this.baseDir, 'monitoring.env.example');
    fs.writeFileSync(envPath, envTemplate);
    console.log(`   ✅ Created: ${envPath}`);
  }

  async createCronJobs() {
    console.log('⏰ Creating cron job templates...');
    
    const cronTemplate = `# Monitoring & Resilience Testing Cron Jobs
# Add these to your crontab with: crontab -e

# Health checks every 5 minutes
*/5 * * * * cd ${this.baseDir} && node monitoring/health-checker.js >> logs/health-check.log 2>&1

# Performance monitoring every 10 minutes
*/10 * * * * cd ${this.baseDir} && node monitoring/performance-monitor.js >> logs/performance.log 2>&1

# Resilience testing daily at 2 AM
0 2 * * * cd ${this.baseDir} && npm run test:resilience >> logs/resilience.log 2>&1

# Dashboard generation every 30 minutes
*/30 * * * * cd ${this.baseDir} && node monitoring/dashboard-generator.js >> logs/dashboard.log 2>&1

# Daily summary at 9 AM
0 9 * * * cd ${this.baseDir} && node monitoring/alert-manager.js --daily-summary >> logs/alerts.log 2>&1
`;

    const cronPath = path.join(this.baseDir, 'monitoring.cron');
    fs.writeFileSync(cronPath, cronTemplate);
    console.log(`   ✅ Created: ${cronPath}`);
  }

  async createSystemdService() {
    console.log('🔧 Creating systemd service template...');
    
    const serviceTemplate = `[Unit]
Description=Website Monitoring System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=${this.baseDir}
ExecStart=/usr/bin/node monitoring/monitoring-orchestrator.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
`;

    const servicePath = path.join(this.baseDir, 'monitoring.service');
    fs.writeFileSync(servicePath, serviceTemplate);
    console.log(`   ✅ Created: ${servicePath}`);
  }

  async createDocumentation() {
    console.log('📚 Creating documentation...');
    
    const readmeContent = `# Monitoring & Resilience Testing System

## Overview
This system provides comprehensive monitoring, alerting, and resilience testing for your website.

## Features
- 🔍 **Health Monitoring**: API endpoints, database, pages, system resources
- 🏃 **Performance Monitoring**: Response times, query performance, memory usage
- 🚨 **Intelligent Alerting**: Email, Slack, Discord notifications with cooldown
- 🧪 **Resilience Testing**: API failures, database outages, load testing
- 📊 **Real-time Dashboard**: Visual monitoring dashboard with metrics
- 🔄 **Auto-Recovery**: Tests recovery mechanisms and graceful degradation

## Quick Start

### 1. Setup Environment
\`\`\`bash
# Copy environment template
cp monitoring.env.example .env.local

# Edit with your configuration
nano .env.local
\`\`\`

### 2. Start Monitoring
\`\`\`bash
# Start continuous monitoring
npm run monitor:continuous

# Or run individual checks
npm run monitor:health
npm run monitor:performance
npm run test:resilience
\`\`\`

### 3. Access Dashboard
Open \`monitoring-dashboard/index.html\` in your browser.

## Commands

### Monitoring
- \`npm run monitor:health\` - Run health checks
- \`npm run monitor:performance\` - Run performance monitoring
- \`npm run monitor:alerts\` - Check alert status
- \`npm run monitor:dashboard\` - Generate dashboard
- \`npm run monitor:start\` - Start monitoring orchestrator
- \`npm run monitor:continuous\` - Start continuous monitoring

### Resilience Testing
- \`npm run test:resilience\` - Run all resilience tests
- \`npm run test:api-failures\` - Test API failure scenarios
- \`npm run test:db-failures\` - Test database failure scenarios
- \`npm run test:load-stress\` - Test load and stress scenarios
- \`npm run test:recovery\` - Test recovery mechanisms

### Combined Testing
- \`npm run monitor:all\` - Run all monitoring and testing
- \`npm run test:all\` - Run all test suites

## Configuration

### Alert Thresholds
- **Critical**: Response time > 10s, Memory usage > 95%, Error rate > 10%
- **Warning**: Response time > 5s, Memory usage > 80%, Error rate > 5%

### Monitoring Intervals
- **Health Checks**: Every 5 minutes
- **Performance**: Every 10 minutes
- **Resilience**: Daily at 2 AM
- **Dashboard**: Every 30 minutes

## Alert Channels

### Email Alerts
Configure SMTP settings in \`.env.local\`:
\`\`\`
ALERT_EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
\`\`\`

### Slack Alerts
Add webhook URL to \`.env.local\`:
\`\`\`
ALERT_SLACK_ENABLED=true
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
\`\`\`

### Discord Alerts
Add webhook URL to \`.env.local\`:
\`\`\`
ALERT_DISCORD_ENABLED=true
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR/WEBHOOK
\`\`\`

## CI/CD Integration

### GitHub Actions
The system includes GitHub Actions workflows for:
- Automated health checks
- Performance monitoring
- Resilience testing
- Security testing
- Dashboard generation
- Alert processing

### Vercel Integration
Configure environment variables in Vercel dashboard for production monitoring.

## File Structure
\`\`\`
monitoring/
├── health-checker.js          # Health monitoring
├── performance-monitor.js     # Performance monitoring
├── alert-manager.js          # Alert management
├── dashboard-generator.js    # Dashboard generation
└── monitoring-orchestrator.js # Main orchestrator

tests/resilience/
├── api-failure-tests.js      # API failure simulation
├── database-failure-tests.js # Database failure simulation
├── load-stress-tests.js      # Load and stress testing
└── recovery-tests.js         # Recovery testing

config/
└── monitoring-config.js      # Configuration settings

.github/workflows/
└── monitoring.yml            # CI/CD workflows
\`\`\`

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure POSTGRES_URL is set correctly
2. **Email Alerts**: Check SMTP credentials and firewall settings
3. **Webhook Alerts**: Verify webhook URLs are correct
4. **Permission Issues**: Ensure proper file permissions for logs

### Logs
- Health checks: \`logs/health-check.log\`
- Performance: \`logs/performance.log\`
- Resilience: \`logs/resilience.log\`
- Dashboard: \`logs/dashboard.log\`
- Alerts: \`logs/alerts.log\`

## Support
For issues or questions, check the logs and ensure all environment variables are configured correctly.
`;

    const readmePath = path.join(this.baseDir, 'MONITORING_README.md');
    fs.writeFileSync(readmePath, readmeContent);
    console.log(`   ✅ Created: ${readmePath}`);
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new MonitoringSetup();
  setup.setup().catch(console.error);
}

module.exports = MonitoringSetup;
