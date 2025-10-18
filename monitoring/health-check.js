#!/usr/bin/env node

/**
 * Health Check Monitor
 * Monitors application health and sends alerts on failures
 */

const axios = require('axios');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.APP_URL || 'http://localhost:3000',
  checkInterval: 60000, // 1 minute
  alertEmail: process.env.ALERT_EMAIL || 'admin@aicbolt.com',
  smtpConfig: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  webhookUrl: process.env.WEBHOOK_URL,
  logFile: path.join(__dirname, 'monitoring-reports', 'health-check.log')
};

class HealthMonitor {
  constructor() {
    this.isRunning = false;
    this.consecutiveFailures = 0;
    this.lastAlertTime = 0;
    this.alertCooldown = 300000; // 5 minutes
    this.transporter = null;
    this.init();
  }

  async init() {
    try {
      // Create reports directory
      await fs.mkdir(path.dirname(CONFIG.logFile), { recursive: true });
      
      // Initialize email transporter
      if (CONFIG.smtpConfig.auth.user) {
        this.transporter = nodemailer.createTransporter(CONFIG.smtpConfig);
      }
      
      console.log('🏥 Health Monitor initialized');
      this.start();
    } catch (error) {
      console.error('❌ Failed to initialize health monitor:', error);
    }
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🔄 Starting health monitoring...');
    
    // Initial check
    await this.performHealthCheck();
    
    // Set up interval
    setInterval(async () => {
      await this.performHealthCheck();
    }, CONFIG.checkInterval);
  }

  async performHealthCheck() {
    const timestamp = new Date().toISOString();
    const results = {
      timestamp,
      status: 'healthy',
      checks: {},
      responseTime: 0,
      errors: []
    };

    try {
      const startTime = Date.now();
      
      // Check main application
      const appCheck = await this.checkEndpoint('/');
      results.checks.app = appCheck;
      
      // Check API endpoints
      const apiChecks = await Promise.allSettled([
        this.checkEndpoint('/api/analytics'),
        this.checkEndpoint('/api/clients'),
        this.checkEndpoint('/api/projects'),
        this.checkEndpoint('/api/user')
      ]);
      
      results.checks.apis = apiChecks.map((result, index) => ({
        endpoint: ['/api/analytics', '/api/clients', '/api/projects', '/api/user'][index],
        status: result.status === 'fulfilled' ? 'healthy' : 'unhealthy',
        error: result.status === 'rejected' ? result.reason.message : null
      }));
      
      // Check database connectivity
      const dbCheck = await this.checkDatabase();
      results.checks.database = dbCheck;
      
      results.responseTime = Date.now() - startTime;
      
      // Determine overall status
      const allChecks = [appCheck, dbCheck, ...results.checks.apis];
      const unhealthyChecks = allChecks.filter(check => check.status === 'unhealthy');
      
      if (unhealthyChecks.length > 0) {
        results.status = 'unhealthy';
        results.errors = unhealthyChecks.map(check => check.error).filter(Boolean);
      }
      
      // Log results
      await this.logResults(results);
      
      // Handle alerts
      if (results.status === 'unhealthy') {
        this.consecutiveFailures++;
        await this.handleFailure(results);
      } else {
        this.consecutiveFailures = 0;
        console.log(`✅ Health check passed (${results.responseTime}ms)`);
      }
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      results.status = 'unhealthy';
      results.errors.push(error.message);
      await this.logResults(results);
      await this.handleFailure(results);
    }
  }

  async checkEndpoint(endpoint) {
    try {
      const response = await axios.get(`${CONFIG.baseUrl}${endpoint}`, {
        timeout: 10000,
        validateStatus: (status) => status < 500 // Accept redirects and client errors
      });
      
      return {
        status: 'healthy',
        responseTime: response.headers['x-response-time'] || 'unknown',
        statusCode: response.status
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        statusCode: error.response?.status || 'timeout'
      };
    }
  }

  async checkDatabase() {
    try {
      // This would check your actual database connection
      // For now, we'll simulate a database check
      const response = await axios.get(`${CONFIG.baseUrl}/api/health/db`, {
        timeout: 5000
      });
      
      return {
        status: 'healthy',
        responseTime: response.data.responseTime || 'unknown'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  async logResults(results) {
    try {
      const logEntry = JSON.stringify(results) + '\n';
      await fs.appendFile(CONFIG.logFile, logEntry);
    } catch (error) {
      console.error('Failed to log results:', error);
    }
  }

  async handleFailure(results) {
    const now = Date.now();
    
    // Check if we should send an alert
    if (this.consecutiveFailures >= 3 && (now - this.lastAlertTime) > this.alertCooldown) {
      await this.sendAlert(results);
      this.lastAlertTime = now;
    }
    
    console.log(`⚠️ Health check failed (${this.consecutiveFailures} consecutive failures)`);
  }

  async sendAlert(results) {
    const subject = `🚨 AICBOLT Health Alert - ${results.status.toUpperCase()}`;
    const html = this.generateAlertHTML(results);
    
    // Send email alert
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: CONFIG.smtpConfig.auth.user,
          to: CONFIG.alertEmail,
          subject,
          html
        });
        console.log('📧 Alert email sent');
      } catch (error) {
        console.error('Failed to send email alert:', error);
      }
    }
    
    // Send webhook alert
    if (CONFIG.webhookUrl) {
      try {
        await axios.post(CONFIG.webhookUrl, {
          text: subject,
          attachments: [{
            color: 'danger',
            fields: [
              { title: 'Status', value: results.status, short: true },
              { title: 'Response Time', value: `${results.responseTime}ms`, short: true },
              { title: 'Errors', value: results.errors.join(', ') || 'None', short: false }
            ]
          }]
        });
        console.log('🔗 Webhook alert sent');
      } catch (error) {
        console.error('Failed to send webhook alert:', error);
      }
    }
  }

  generateAlertHTML(results) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">🚨 AICBOLT Health Alert</h2>
        <p><strong>Status:</strong> ${results.status.toUpperCase()}</p>
        <p><strong>Time:</strong> ${results.timestamp}</p>
        <p><strong>Response Time:</strong> ${results.responseTime}ms</p>
        
        <h3>Check Results:</h3>
        <ul>
          <li><strong>App:</strong> ${results.checks.app?.status || 'unknown'}</li>
          <li><strong>Database:</strong> ${results.checks.database?.status || 'unknown'}</li>
          ${results.checks.apis?.map(api => `<li><strong>${api.endpoint}:</strong> ${api.status}</li>`).join('')}
        </ul>
        
        ${results.errors.length > 0 ? `
          <h3>Errors:</h3>
          <ul>
            ${results.errors.map(error => `<li style="color: #dc2626;">${error}</li>`).join('')}
          </ul>
        ` : ''}
        
        <p style="margin-top: 20px; padding: 10px; background: #f3f4f6; border-radius: 4px;">
          This alert was triggered after ${this.consecutiveFailures} consecutive failures.
        </p>
      </div>
    `;
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 Health monitoring stopped');
  }
}

// Start monitoring if run directly
if (require.main === module) {
  const monitor = new HealthMonitor();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down health monitor...');
    monitor.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down health monitor...');
    monitor.stop();
    process.exit(0);
  });
}

module.exports = HealthMonitor;
