const axios = require('axios');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env.local' });

class PerformanceMonitor {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3003';
    this.db = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
    this.metrics = {
      timestamp: new Date().toISOString(),
      performance: {
        api: [],
        database: [],
        pages: [],
        system: {}
      },
      trends: {
        apiResponseTime: [],
        databaseQueryTime: [],
        pageLoadTime: [],
        memoryUsage: []
      },
      alerts: []
    };
  }

  async measureApiPerformance() {
    const endpoints = [
      { url: '/api/user', name: 'User API' },
      { url: '/api/dashboard', name: 'Dashboard API' },
      { url: '/api/users', name: 'Users API' },
      { url: '/api/clients', name: 'Clients API' },
      { url: '/api/projects', name: 'Projects API' }
    ];

    for (const endpoint of endpoints) {
      const measurements = [];
      
      // Take 3 measurements for average
      for (let i = 0; i < 3; i++) {
        try {
          const startTime = Date.now();
          const response = await axios.get(`${this.baseUrl}${endpoint.url}`, { 
            timeout: 10000,
            validateStatus: (status) => status < 500
          });
          const endTime = Date.now();
          const responseTime = endTime - startTime;

          measurements.push({
            responseTime: responseTime,
            status: response.status,
            timestamp: new Date().toISOString()
          });

          // Small delay between measurements
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          measurements.push({
            responseTime: null,
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      const avgResponseTime = measurements
        .filter(m => m.responseTime !== null)
        .reduce((sum, m) => sum + m.responseTime, 0) / measurements.filter(m => m.responseTime !== null).length;

      const metric = {
        endpoint: endpoint.url,
        name: endpoint.name,
        measurements: measurements,
        avgResponseTime: avgResponseTime || null,
        successRate: measurements.filter(m => m.status !== 'error').length / measurements.length,
        timestamp: new Date().toISOString()
      };

      this.metrics.performance.api.push(metric);
      this.metrics.trends.apiResponseTime.push({
        endpoint: endpoint.url,
        responseTime: avgResponseTime,
        timestamp: new Date().toISOString()
      });

      if (avgResponseTime && avgResponseTime > 3000) {
        this.metrics.alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `${endpoint.name} average response time is ${Math.round(avgResponseTime)}ms`,
          endpoint: endpoint.url,
          responseTime: avgResponseTime
        });
      }

      console.log(`📊 ${endpoint.name}: ${avgResponseTime ? Math.round(avgResponseTime) + 'ms' : 'error'} (${Math.round(metric.successRate * 100)}% success)`);
    }
  }

  async measureDatabasePerformance() {
    const queries = [
      { name: 'User Count', query: 'SELECT COUNT(*) FROM users WHERE deleted_at IS NULL' },
      { name: 'Active Users', query: 'SELECT COUNT(*) FROM users WHERE is_active = true AND deleted_at IS NULL' },
      { name: 'Team Members', query: 'SELECT COUNT(*) FROM team_members' },
      { name: 'Activity Logs', query: 'SELECT COUNT(*) FROM activity_logs' },
      { name: 'Complex Join', query: `
        SELECT u.username, t.name as team_name
        FROM users u
        LEFT JOIN team_members tm ON u.id = tm.user_id
        LEFT JOIN teams t ON tm.team_id = t.id
        WHERE u.deleted_at IS NULL
        LIMIT 100
      `}
    ];

    for (const query of queries) {
      const measurements = [];
      
      // Take 3 measurements for average
      for (let i = 0; i < 3; i++) {
        try {
          const startTime = Date.now();
          const result = await this.db.query(query.query);
          const endTime = Date.now();
          const queryTime = endTime - startTime;

          measurements.push({
            queryTime: queryTime,
            rowCount: result.rows.length,
            timestamp: new Date().toISOString()
          });

          // Small delay between measurements
          await new Promise(resolve => setTimeout(resolve, 50));
        } catch (error) {
          measurements.push({
            queryTime: null,
            rowCount: 0,
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      const avgQueryTime = measurements
        .filter(m => m.queryTime !== null)
        .reduce((sum, m) => sum + m.queryTime, 0) / measurements.filter(m => m.queryTime !== null).length;

      const metric = {
        query: query.name,
        sql: query.query.substring(0, 100) + '...',
        measurements: measurements,
        avgQueryTime: avgQueryTime || null,
        successRate: measurements.filter(m => m.queryTime !== null).length / measurements.length,
        timestamp: new Date().toISOString()
      };

      this.metrics.performance.database.push(metric);
      this.metrics.trends.databaseQueryTime.push({
        query: query.name,
        queryTime: avgQueryTime,
        timestamp: new Date().toISOString()
      });

      if (avgQueryTime && avgQueryTime > 2000) {
        this.metrics.alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `Database query "${query.name}" is slow (${Math.round(avgQueryTime)}ms)`,
          query: query.name,
          queryTime: avgQueryTime
        });
      }

      console.log(`📊 ${query.name}: ${avgQueryTime ? Math.round(avgQueryTime) + 'ms' : 'error'} (${Math.round(metric.successRate * 100)}% success)`);
    }
  }

  async measurePagePerformance() {
    const pages = [
      { url: '/', name: 'Homepage' },
      { url: '/sign-in', name: 'Sign In' },
      { url: '/profit-plan', name: 'Profit Plan' },
      { url: '/dashboard', name: 'Dashboard' }
    ];

    for (const page of pages) {
      const measurements = [];
      
      // Take 3 measurements for average
      for (let i = 0; i < 3; i++) {
        try {
          const startTime = Date.now();
          const response = await axios.get(`${this.baseUrl}${page.url}`, { 
            timeout: 15000,
            validateStatus: (status) => status < 500
          });
          const endTime = Date.now();
          const loadTime = endTime - startTime;

          measurements.push({
            loadTime: loadTime,
            status: response.status,
            contentLength: response.headers['content-length'] || 0,
            timestamp: new Date().toISOString()
          });

          // Small delay between measurements
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          measurements.push({
            loadTime: null,
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }

      const avgLoadTime = measurements
        .filter(m => m.loadTime !== null)
        .reduce((sum, m) => sum + m.loadTime, 0) / measurements.filter(m => m.loadTime !== null).length;

      const metric = {
        page: page.url,
        name: page.name,
        measurements: measurements,
        avgLoadTime: avgLoadTime || null,
        successRate: measurements.filter(m => m.loadTime !== null).length / measurements.length,
        timestamp: new Date().toISOString()
      };

      this.metrics.performance.pages.push(metric);
      this.metrics.trends.pageLoadTime.push({
        page: page.url,
        loadTime: avgLoadTime,
        timestamp: new Date().toISOString()
      });

      if (avgLoadTime && avgLoadTime > 5000) {
        this.metrics.alerts.push({
          type: 'performance',
          severity: 'warning',
          message: `${page.name} loads slowly (${Math.round(avgLoadTime)}ms)`,
          page: page.url,
          loadTime: avgLoadTime
        });
      }

      console.log(`📊 ${page.name}: ${avgLoadTime ? Math.round(avgLoadTime) + 'ms' : 'error'} (${Math.round(metric.successRate * 100)}% success)`);
    }
  }

  async measureSystemResources() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.performance.system = {
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        rss: Math.round(memUsage.rss / 1024 / 1024) // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };

    this.metrics.trends.memoryUsage.push({
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      timestamp: new Date().toISOString()
    });

    const memoryUsagePercent = memUsage.heapUsed / memUsage.heapTotal;
    if (memoryUsagePercent > 0.9) {
      this.metrics.alerts.push({
        type: 'resource',
        severity: 'critical',
        message: `High memory usage: ${Math.round(memoryUsagePercent * 100)}%`,
        memoryUsage: Math.round(memUsage.heapUsed / 1024 / 1024),
        memoryPercent: Math.round(memoryUsagePercent * 100)
      });
    }

    console.log(`📊 System: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB memory, ${Math.round(process.uptime())}s uptime`);
  }

  async analyzeTrends() {
    console.log('\n📈 Performance Trends Analysis:');
    console.log('================================');

    // Analyze API response time trends
    const apiTrends = this.metrics.trends.apiResponseTime;
    if (apiTrends.length > 0) {
      const avgApiTime = apiTrends.reduce((sum, t) => sum + (t.responseTime || 0), 0) / apiTrends.length;
      console.log(`📊 Average API Response Time: ${Math.round(avgApiTime)}ms`);
    }

    // Analyze database query trends
    const dbTrends = this.metrics.trends.databaseQueryTime;
    if (dbTrends.length > 0) {
      const avgDbTime = dbTrends.reduce((sum, t) => sum + (t.queryTime || 0), 0) / dbTrends.length;
      console.log(`📊 Average Database Query Time: ${Math.round(avgDbTime)}ms`);
    }

    // Analyze page load trends
    const pageTrends = this.metrics.trends.pageLoadTime;
    if (pageTrends.length > 0) {
      const avgPageTime = pageTrends.reduce((sum, t) => sum + (t.loadTime || 0), 0) / pageTrends.length;
      console.log(`📊 Average Page Load Time: ${Math.round(avgPageTime)}ms`);
    }

    // Analyze memory trends
    const memoryTrends = this.metrics.trends.memoryUsage;
    if (memoryTrends.length > 0) {
      const latestMemory = memoryTrends[memoryTrends.length - 1];
      console.log(`📊 Current Memory Usage: ${latestMemory.heapUsed}MB / ${latestMemory.heapTotal}MB`);
    }
  }

  async runPerformanceMonitoring() {
    console.log('🏃 Starting Performance Monitoring...');
    console.log('=====================================');

    await this.measureApiPerformance();
    await this.measureDatabasePerformance();
    await this.measurePagePerformance();
    await this.measureSystemResources();
    await this.analyzeTrends();

    console.log(`\n🎯 Performance Monitoring Complete`);
    console.log(`📊 API Endpoints: ${this.metrics.performance.api.length}`);
    console.log(`📊 Database Queries: ${this.metrics.performance.database.length}`);
    console.log(`📊 Pages: ${this.metrics.performance.pages.length}`);
    console.log(`🚨 Alerts: ${this.metrics.alerts.length}`);

    if (this.metrics.alerts.length > 0) {
      console.log('\n🚨 Performance Alerts:');
      this.metrics.alerts.forEach((alert, index) => {
        console.log(`${index + 1}. [${alert.severity.toUpperCase()}] ${alert.message}`);
      });
    }

    return this.metrics;
  }

  async saveMetrics() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `performance-metrics-${timestamp}.json`;
    const filepath = path.join(__dirname, '..', 'monitoring-reports', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filepath, JSON.stringify(this.metrics, null, 2));
    console.log(`📊 Performance metrics saved to: ${filepath}`);
    
    return filepath;
  }

  async cleanup() {
    if (this.db) {
      await this.db.end();
    }
  }
}

// Run performance monitoring if called directly
if (require.main === module) {
  const performanceMonitor = new PerformanceMonitor();
  
  performanceMonitor.runPerformanceMonitoring()
    .then(() => performanceMonitor.saveMetrics())
    .then(() => performanceMonitor.cleanup())
    .catch(error => {
      console.error('❌ Performance monitoring failed:', error);
      process.exit(1);
    });
}

module.exports = PerformanceMonitor;
