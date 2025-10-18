const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const axios = require('axios');

class AlertManager {
  constructor() {
    this.config = {
      email: {
        enabled: process.env.ALERT_EMAIL_ENABLED === 'true',
        smtp: {
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        },
        from: process.env.ALERT_EMAIL_FROM || 'alerts@yourwebsite.com',
        to: process.env.ALERT_EMAIL_TO ? process.env.ALERT_EMAIL_TO.split(',') : ['admin@yourwebsite.com']
      },
      slack: {
        enabled: process.env.ALERT_SLACK_ENABLED === 'true',
        webhook: process.env.SLACK_WEBHOOK_URL
      },
      discord: {
        enabled: process.env.ALERT_DISCORD_ENABLED === 'true',
        webhook: process.env.DISCORD_WEBHOOK_URL
      },
      thresholds: {
        critical: {
          responseTime: 10000, // 10 seconds
          errorRate: 0.1, // 10%
          memoryUsage: 0.95, // 95%
          downtime: 300 // 5 minutes
        },
        warning: {
          responseTime: 5000, // 5 seconds
          errorRate: 0.05, // 5%
          memoryUsage: 0.8, // 80%
          downtime: 60 // 1 minute
        }
      }
    };
    
    this.alertHistory = [];
    this.loadAlertHistory();
  }

  loadAlertHistory() {
    const historyFile = path.join(__dirname, '..', 'monitoring-reports', 'alert-history.json');
    if (fs.existsSync(historyFile)) {
      try {
        this.alertHistory = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      } catch (error) {
        console.log('⚠️ Could not load alert history:', error.message);
        this.alertHistory = [];
      }
    }
  }

  saveAlertHistory() {
    const historyFile = path.join(__dirname, '..', 'monitoring-reports', 'alert-history.json');
    const dir = path.dirname(historyFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(historyFile, JSON.stringify(this.alertHistory, null, 2));
  }

  shouldSendAlert(alert) {
    const now = new Date();
    const recentAlerts = this.alertHistory.filter(a => 
      a.type === alert.type && 
      a.endpoint === alert.endpoint &&
      new Date(a.timestamp) > new Date(now.getTime() - 15 * 60 * 1000) // 15 minutes
    );

    // Don't spam with the same alert
    if (recentAlerts.length > 0) {
      return false;
    }

    // Always send critical alerts
    if (alert.severity === 'critical') {
      return true;
    }

    // Send warning alerts if not sent recently
    if (alert.severity === 'warning') {
      const recentWarnings = this.alertHistory.filter(a => 
        a.severity === 'warning' &&
        new Date(a.timestamp) > new Date(now.getTime() - 60 * 60 * 1000) // 1 hour
      );
      return recentWarnings.length < 3; // Max 3 warnings per hour
    }

    return true;
  }

  async sendEmailAlert(alert) {
    if (!this.config.email.enabled || !this.config.email.smtp.auth.user) {
      console.log('📧 Email alerts not configured');
      return;
    }

    try {
      const transporter = nodemailer.createTransporter(this.config.email.smtp);
      
      const subject = `🚨 ${alert.severity.toUpperCase()} Alert: ${alert.message}`;
      const html = `
        <h2>🚨 Website Alert</h2>
        <p><strong>Severity:</strong> ${alert.severity.toUpperCase()}</p>
        <p><strong>Message:</strong> ${alert.message}</p>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        ${alert.endpoint ? `<p><strong>Endpoint:</strong> ${alert.endpoint}</p>` : ''}
        ${alert.page ? `<p><strong>Page:</strong> ${alert.page}</p>` : ''}
        ${alert.responseTime ? `<p><strong>Response Time:</strong> ${alert.responseTime}ms</p>` : ''}
        ${alert.queryTime ? `<p><strong>Query Time:</strong> ${alert.queryTime}ms</p>` : ''}
        ${alert.loadTime ? `<p><strong>Load Time:</strong> ${alert.loadTime}ms</p>` : ''}
        ${alert.memoryUsage ? `<p><strong>Memory Usage:</strong> ${alert.memoryUsage}MB</p>` : ''}
        <hr>
        <p><em>This is an automated alert from your website monitoring system.</em></p>
      `;

      await transporter.sendMail({
        from: this.config.email.from,
        to: this.config.email.to.join(', '),
        subject: subject,
        html: html
      });

      console.log(`📧 Email alert sent: ${alert.message}`);
    } catch (error) {
      console.error('❌ Failed to send email alert:', error.message);
    }
  }

  async sendSlackAlert(alert) {
    if (!this.config.slack.enabled || !this.config.slack.webhook) {
      console.log('💬 Slack alerts not configured');
      return;
    }

    try {
      const color = alert.severity === 'critical' ? '#ff0000' : '#ffaa00';
      const emoji = alert.severity === 'critical' ? '🚨' : '⚠️';
      
      const payload = {
        text: `${emoji} Website Alert: ${alert.message}`,
        attachments: [{
          color: color,
          fields: [
            { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
            { title: 'Time', value: new Date().toISOString(), short: true },
            { title: 'Message', value: alert.message, short: false }
          ]
        }]
      };

      if (alert.endpoint) {
        payload.attachments[0].fields.push({ title: 'Endpoint', value: alert.endpoint, short: true });
      }
      if (alert.responseTime) {
        payload.attachments[0].fields.push({ title: 'Response Time', value: `${alert.responseTime}ms`, short: true });
      }

      await axios.post(this.config.slack.webhook, payload);
      console.log(`💬 Slack alert sent: ${alert.message}`);
    } catch (error) {
      console.error('❌ Failed to send Slack alert:', error.message);
    }
  }

  async sendDiscordAlert(alert) {
    if (!this.config.discord.enabled || !this.config.discord.webhook) {
      console.log('💬 Discord alerts not configured');
      return;
    }

    try {
      const emoji = alert.severity === 'critical' ? '🚨' : '⚠️';
      const color = alert.severity === 'critical' ? 0xff0000 : 0xffaa00;
      
      const payload = {
        embeds: [{
          title: `${emoji} Website Alert`,
          description: alert.message,
          color: color,
          fields: [
            { name: 'Severity', value: alert.severity.toUpperCase(), inline: true },
            { name: 'Time', value: new Date().toISOString(), inline: true }
          ],
          timestamp: new Date().toISOString()
        }]
      };

      if (alert.endpoint) {
        payload.embeds[0].fields.push({ name: 'Endpoint', value: alert.endpoint, inline: true });
      }
      if (alert.responseTime) {
        payload.embeds[0].fields.push({ name: 'Response Time', value: `${alert.responseTime}ms`, inline: true });
      }

      await axios.post(this.config.discord.webhook, payload);
      console.log(`💬 Discord alert sent: ${alert.message}`);
    } catch (error) {
      console.error('❌ Failed to send Discord alert:', error.message);
    }
  }

  async processAlerts(alerts) {
    console.log(`🚨 Processing ${alerts.length} alerts...`);
    
    for (const alert of alerts) {
      if (!this.shouldSendAlert(alert)) {
        console.log(`⏭️ Skipping duplicate alert: ${alert.message}`);
        continue;
      }

      // Add to history
      this.alertHistory.push({
        ...alert,
        timestamp: new Date().toISOString(),
        sent: true
      });

      // Send alerts based on severity
      if (alert.severity === 'critical') {
        await this.sendEmailAlert(alert);
        await this.sendSlackAlert(alert);
        await this.sendDiscordAlert(alert);
      } else if (alert.severity === 'warning') {
        await this.sendSlackAlert(alert);
        await this.sendDiscordAlert(alert);
      }

      console.log(`✅ Alert processed: ${alert.message}`);
    }

    // Save updated history
    this.saveAlertHistory();
  }

  async sendDailySummary(healthResults, performanceResults) {
    if (!this.config.email.enabled) {
      console.log('📧 Daily summary not configured');
      return;
    }

    try {
      const transporter = nodemailer.createTransporter(this.config.email.smtp);
      
      const subject = `📊 Daily Website Health Summary - ${new Date().toLocaleDateString()}`;
      
      const healthSummary = healthResults ? `
        <h3>🔍 Health Check Summary</h3>
        <p><strong>Overall Status:</strong> ${healthResults.overall}</p>
        <p><strong>Total Checks:</strong> ${healthResults.checks.length}</p>
        <p><strong>Active Alerts:</strong> ${healthResults.alerts.length}</p>
      ` : '';

      const performanceSummary = performanceResults ? `
        <h3>🏃 Performance Summary</h3>
        <p><strong>API Endpoints Monitored:</strong> ${performanceResults.performance.api.length}</p>
        <p><strong>Database Queries Monitored:</strong> ${performanceResults.performance.database.length}</p>
        <p><strong>Pages Monitored:</strong> ${performanceResults.performance.pages.length}</p>
        <p><strong>Performance Alerts:</strong> ${performanceResults.alerts.length}</p>
      ` : '';

      const html = `
        <h2>📊 Daily Website Health Summary</h2>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleTimeString()}</p>
        
        ${healthSummary}
        ${performanceSummary}
        
        <h3>🚨 Recent Alerts</h3>
        <ul>
          ${this.alertHistory.slice(-5).map(alert => 
            `<li><strong>${alert.severity.toUpperCase()}:</strong> ${alert.message} (${new Date(alert.timestamp).toLocaleString()})</li>`
          ).join('')}
        </ul>
        
        <hr>
        <p><em>This is an automated daily summary from your website monitoring system.</em></p>
      `;

      await transporter.sendMail({
        from: this.config.email.from,
        to: this.config.email.to.join(', '),
        subject: subject,
        html: html
      });

      console.log('📧 Daily summary sent');
    } catch (error) {
      console.error('❌ Failed to send daily summary:', error.message);
    }
  }

  getAlertStats() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentAlerts = this.alertHistory.filter(alert => 
      new Date(alert.timestamp) > last24h
    );

    return {
      total: this.alertHistory.length,
      last24h: recentAlerts.length,
      critical: recentAlerts.filter(a => a.severity === 'critical').length,
      warning: recentAlerts.filter(a => a.severity === 'warning').length,
      byType: recentAlerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

module.exports = AlertManager;
