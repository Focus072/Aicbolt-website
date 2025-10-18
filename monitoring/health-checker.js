const axios = require('axios');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env.local' });

class HealthChecker {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3003';
    this.db = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
    this.results = {
      timestamp: new Date().toISOString(),
      overall: 'healthy',
      checks: [],
      alerts: []
    };
  }

  async checkApiHealth() {
    const endpoints = [
      { url: '/api/user', name: 'User API', critical: true },
      { url: '/api/dashboard', name: 'Dashboard API', critical: true },
      { url: '/api/users', name: 'Users API', critical: false },
      { url: '/api/clients', name: 'Clients API', critical: true },
      { url: '/api/projects', name: 'Projects API', critical: true }
    ];

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${this.baseUrl}${endpoint.url}`, { 
          timeout: 5000,
          validateStatus: (status) => status < 500 // Accept 401/403 as healthy
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const check = {
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          responseTime: responseTime,
          healthy: response.status < 500,
          critical: endpoint.critical,
          timestamp: new Date().toISOString()
        };

        this.results.checks.push(check);

        if (responseTime > 3000) {
          this.results.alerts.push({
            type: 'performance',
            severity: 'warning',
            message: `${endpoint.name} is slow (${responseTime}ms)`,
            endpoint: endpoint.url,
            responseTime: responseTime
          });
        }

        if (response.status >= 500) {
          this.results.alerts.push({
            type: 'error',
            severity: 'critical',
            message: `${endpoint.name} returned ${response.status}`,
            endpoint: endpoint.url,
            status: response.status
          });
        }

        console.log(`✅ ${endpoint.name}: ${response.status} (${responseTime}ms)`);
      } catch (error) {
        const check = {
          name: endpoint.name,
          url: endpoint.url,
          status: 'error',
          responseTime: null,
          healthy: false,
          critical: endpoint.critical,
          error: error.message,
          timestamp: new Date().toISOString()
        };

        this.results.checks.push(check);

        if (endpoint.critical) {
          this.results.alerts.push({
            type: 'error',
            severity: 'critical',
            message: `${endpoint.name} is down: ${error.message}`,
            endpoint: endpoint.url,
            error: error.message
          });
        }

        console.log(`❌ ${endpoint.name}: ${error.message}`);
      }
    }
  }

  async checkDatabaseHealth() {
    try {
      const startTime = Date.now();
      
      // Test basic connection
      await this.db.query('SELECT 1');
      const connectionTime = Date.now() - startTime;

      // Test query performance
      const queryStartTime = Date.now();
      const userCount = await this.db.query('SELECT COUNT(*) FROM users WHERE deleted_at IS NULL');
      const queryTime = Date.now() - queryStartTime;

      // Test for orphaned records
      const orphanedCheck = await this.db.query(`
        SELECT COUNT(*) as count
        FROM team_members tm
        LEFT JOIN users u ON tm.user_id = u.id
        WHERE u.id IS NULL
      `);

      const check = {
        name: 'Database Health',
        connectionTime: connectionTime,
        queryTime: queryTime,
        userCount: parseInt(userCount.rows[0].count),
        orphanedRecords: parseInt(orphanedCheck.rows[0].count),
        healthy: connectionTime < 1000 && queryTime < 2000,
        timestamp: new Date().toISOString()
      };

      this.results.checks.push(check);

      if (connectionTime > 1000) {
        this.results.alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `Database connection slow (${connectionTime}ms)`,
          connectionTime: connectionTime
        });
      }

      if (queryTime > 2000) {
        this.results.alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `Database queries slow (${queryTime}ms)`,
          queryTime: queryTime
        });
      }

      if (check.orphanedRecords > 0) {
        this.results.alerts.push({
          type: 'data',
          severity: 'warning',
          message: `Found ${check.orphanedRecords} orphaned records`,
          orphanedRecords: check.orphanedRecords
        });
      }

      console.log(`✅ Database: ${connectionTime}ms connection, ${queryTime}ms query, ${check.userCount} users`);
    } catch (error) {
      const check = {
        name: 'Database Health',
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      this.results.checks.push(check);

      this.results.alerts.push({
        type: 'error',
        severity: 'critical',
        message: `Database connection failed: ${error.message}`,
        error: error.message
      });

      console.log(`❌ Database: ${error.message}`);
    }
  }

  async checkPageHealth() {
    const pages = [
      { url: '/', name: 'Homepage', critical: true },
      { url: '/sign-in', name: 'Sign In', critical: true },
      { url: '/profit-plan', name: 'Profit Plan', critical: false },
      { url: '/dashboard', name: 'Dashboard', critical: true }
    ];

    for (const page of pages) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${this.baseUrl}${page.url}`, { 
          timeout: 10000,
          validateStatus: (status) => status < 500
        });
        const endTime = Date.now();
        const loadTime = endTime - startTime;

        const check = {
          name: page.name,
          url: page.url,
          status: response.status,
          loadTime: loadTime,
          healthy: response.status < 500 && loadTime < 5000,
          critical: page.critical,
          timestamp: new Date().toISOString()
        };

        this.results.checks.push(check);

        if (loadTime > 5000) {
          this.results.alerts.push({
            type: 'performance',
            severity: 'warning',
            message: `${page.name} loads slowly (${loadTime}ms)`,
            page: page.url,
            loadTime: loadTime
          });
        }

        if (response.status >= 500) {
          this.results.alerts.push({
            type: 'error',
            severity: 'critical',
            message: `${page.name} returned ${response.status}`,
            page: page.url,
            status: response.status
          });
        }

        console.log(`✅ ${page.name}: ${response.status} (${loadTime}ms)`);
      } catch (error) {
        const check = {
          name: page.name,
          url: page.url,
          status: 'error',
          loadTime: null,
          healthy: false,
          critical: page.critical,
          error: error.message,
          timestamp: new Date().toISOString()
        };

        this.results.checks.push(check);

        if (page.critical) {
          this.results.alerts.push({
            type: 'error',
            severity: 'critical',
            message: `${page.name} is down: ${error.message}`,
            page: page.url,
            error: error.message
          });
        }

        console.log(`❌ ${page.name}: ${error.message}`);
      }
    }
  }

  async checkSystemResources() {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      const check = {
        name: 'System Resources',
        memoryUsage: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        memoryTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        cpuUsage: cpuUsage,
        healthy: memUsage.heapUsed / memUsage.heapTotal < 0.9,
        timestamp: new Date().toISOString()
      };

      this.results.checks.push(check);

      if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
        this.results.alerts.push({
          type: 'resource',
          severity: 'critical',
          message: `High memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          memoryUsage: Math.round(memUsage.heapUsed / 1024 / 1024)
        });
      }

      console.log(`✅ System: ${check.memoryUsage}MB memory, CPU usage tracked`);
    } catch (error) {
      console.log(`⚠️ System resource check failed: ${error.message}`);
    }
  }

  async runAllChecks() {
    console.log('🔍 Starting Health Check...');
    console.log('==========================');

    await this.checkApiHealth();
    await this.checkDatabaseHealth();
    await this.checkPageHealth();
    await this.checkSystemResources();

    // Determine overall health
    const criticalFailures = this.results.checks.filter(check => 
      check.critical && !check.healthy
    );

    if (criticalFailures.length > 0) {
      this.results.overall = 'critical';
    } else if (this.results.alerts.length > 0) {
      this.results.overall = 'warning';
    } else {
      this.results.overall = 'healthy';
    }

    console.log(`\n🎯 Overall Health: ${this.results.overall.toUpperCase()}`);
    console.log(`📊 Checks: ${this.results.checks.length}`);
    console.log(`🚨 Alerts: ${this.results.alerts.length}`);

    if (this.results.alerts.length > 0) {
      console.log('\n🚨 Active Alerts:');
      this.results.alerts.forEach((alert, index) => {
        console.log(`${index + 1}. [${alert.severity.toUpperCase()}] ${alert.message}`);
      });
    }

    return this.results;
  }

  async saveResults() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `health-check-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'monitoring-reports', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));
    console.log(`📊 Health check results saved to: ${filepath}`);
    
    return filepath;
  }

  async cleanup() {
    if (this.db) {
      await this.db.end();
    }
  }
}

// Run health check if called directly
if (require.main === module) {
  const healthChecker = new HealthChecker();
  
  healthChecker.runAllChecks()
    .then(() => healthChecker.saveResults())
    .then(() => healthChecker.cleanup())
    .catch(error => {
      console.error('❌ Health check failed:', error);
      process.exit(1);
    });
}

module.exports = HealthChecker;
