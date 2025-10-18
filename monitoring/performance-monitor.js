#!/usr/bin/env node

/**
 * Performance Monitor
 * Tracks application performance metrics and generates reports
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  baseUrl: process.env.APP_URL || 'http://localhost:3000',
  checkInterval: 30000, // 30 seconds
  logFile: path.join(__dirname, 'monitoring-reports', 'performance.log'),
  thresholds: {
    responseTime: 2000, // 2 seconds
    errorRate: 0.05, // 5%
    memoryUsage: 0.8, // 80%
    cpuUsage: 0.8 // 80%
  }
};

class PerformanceMonitor {
  constructor() {
    this.isRunning = false;
    this.metrics = {
      responseTimes: [],
      errorRates: [],
      memoryUsage: [],
      cpuUsage: [],
      requestsPerSecond: [],
      timestamp: []
    };
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(path.dirname(CONFIG.logFile), { recursive: true });
      console.log('📊 Performance Monitor initialized');
    } catch (error) {
      console.error('❌ Failed to initialize performance monitor:', error);
    }
  }

  async start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 Starting performance monitoring...');
    
    // Set up interval
    setInterval(async () => {
      await this.collectMetrics();
    }, CONFIG.checkInterval);
    
    // Initial collection
    await this.collectMetrics();
  }

  async collectMetrics() {
    const timestamp = new Date().toISOString();
    const metrics = {
      timestamp,
      responseTime: 0,
      errorRate: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      requestsPerSecond: 0,
      status: 'healthy'
    };

    try {
      // Test response time
      const responseTime = await this.measureResponseTime();
      metrics.responseTime = responseTime;
      
      // Test error rate
      const errorRate = await this.measureErrorRate();
      metrics.errorRate = errorRate;
      
      // Get system metrics (simulated)
      const systemMetrics = await this.getSystemMetrics();
      metrics.memoryUsage = systemMetrics.memory;
      metrics.cpuUsage = systemMetrics.cpu;
      
      // Calculate requests per second
      metrics.requestsPerSecond = await this.calculateRPS();
      
      // Check thresholds
      if (responseTime > CONFIG.thresholds.responseTime) {
        metrics.status = 'warning';
        console.log(`⚠️ High response time: ${responseTime}ms`);
      }
      
      if (errorRate > CONFIG.thresholds.errorRate) {
        metrics.status = 'critical';
        console.log(`🚨 High error rate: ${(errorRate * 100).toFixed(2)}%`);
      }
      
      if (systemMetrics.memory > CONFIG.thresholds.memoryUsage) {
        metrics.status = 'warning';
        console.log(`⚠️ High memory usage: ${(systemMetrics.memory * 100).toFixed(2)}%`);
      }
      
      if (systemMetrics.cpu > CONFIG.thresholds.cpuUsage) {
        metrics.status = 'warning';
        console.log(`⚠️ High CPU usage: ${(systemMetrics.cpu * 100).toFixed(2)}%`);
      }
      
      // Store metrics
      this.storeMetrics(metrics);
      
      // Log results
      await this.logMetrics(metrics);
      
      console.log(`📊 Performance: ${metrics.responseTime}ms, ${(metrics.errorRate * 100).toFixed(2)}% errors, ${metrics.status}`);
      
    } catch (error) {
      console.error('❌ Failed to collect metrics:', error);
      await this.logMetrics({
        timestamp,
        responseTime: 0,
        errorRate: 1,
        memoryUsage: 0,
        cpuUsage: 0,
        requestsPerSecond: 0,
        status: 'error',
        error: error.message
      });
    }
  }

  async measureResponseTime() {
    const endpoints = [
      '/',
      '/api/analytics',
      '/api/clients',
      '/dashboard'
    ];
    
    const times = [];
    
    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        await axios.get(`${CONFIG.baseUrl}${endpoint}`, {
          timeout: 10000,
          validateStatus: (status) => status < 500
        });
        const responseTime = Date.now() - startTime;
        times.push(responseTime);
      } catch (error) {
        // Count as slow response
        times.push(10000);
      }
    }
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  async measureErrorRate() {
    const endpoints = [
      '/',
      '/api/analytics',
      '/api/clients',
      '/api/projects',
      '/api/user'
    ];
    
    let totalRequests = 0;
    let errors = 0;
    
    for (const endpoint of endpoints) {
      try {
        totalRequests++;
        await axios.get(`${CONFIG.baseUrl}${endpoint}`, {
          timeout: 5000,
          validateStatus: (status) => status < 500
        });
      } catch (error) {
        errors++;
      }
    }
    
    return totalRequests > 0 ? errors / totalRequests : 0;
  }

  async getSystemMetrics() {
    try {
      // In a real implementation, you would get actual system metrics
      // For now, we'll simulate them
      return {
        memory: Math.random() * 0.5 + 0.3, // 30-80%
        cpu: Math.random() * 0.4 + 0.2 // 20-60%
      };
    } catch (error) {
      return {
        memory: 0,
        cpu: 0
      };
    }
  }

  async calculateRPS() {
    // Simulate RPS calculation
    return Math.floor(Math.random() * 100) + 50;
  }

  storeMetrics(metrics) {
    this.metrics.responseTimes.push(metrics.responseTime);
    this.metrics.errorRates.push(metrics.errorRate);
    this.metrics.memoryUsage.push(metrics.memoryUsage);
    this.metrics.cpuUsage.push(metrics.cpuUsage);
    this.metrics.requestsPerSecond.push(metrics.requestsPerSecond);
    this.metrics.timestamp.push(metrics.timestamp);
    
    // Keep only last 100 measurements
    const maxMeasurements = 100;
    if (this.metrics.responseTimes.length > maxMeasurements) {
      this.metrics.responseTimes.shift();
      this.metrics.errorRates.shift();
      this.metrics.memoryUsage.shift();
      this.metrics.cpuUsage.shift();
      this.metrics.requestsPerSecond.shift();
      this.metrics.timestamp.shift();
    }
  }

  async logMetrics(metrics) {
    try {
      const logEntry = JSON.stringify(metrics) + '\n';
      await fs.appendFile(CONFIG.logFile, logEntry);
    } catch (error) {
      console.error('Failed to log metrics:', error);
    }
  }

  async generateReport() {
    if (this.metrics.responseTimes.length === 0) {
      console.log('No metrics available for report generation');
      return;
    }
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        averageResponseTime: this.calculateAverage(this.metrics.responseTimes),
        maxResponseTime: Math.max(...this.metrics.responseTimes),
        minResponseTime: Math.min(...this.metrics.responseTimes),
        averageErrorRate: this.calculateAverage(this.metrics.errorRates),
        averageMemoryUsage: this.calculateAverage(this.metrics.memoryUsage),
        averageCpuUsage: this.calculateAverage(this.metrics.cpuUsage),
        averageRPS: this.calculateAverage(this.metrics.requestsPerSecond)
      },
      trends: {
        responseTimeTrend: this.calculateTrend(this.metrics.responseTimes),
        errorRateTrend: this.calculateTrend(this.metrics.errorRates),
        memoryTrend: this.calculateTrend(this.metrics.memoryUsage),
        cpuTrend: this.calculateTrend(this.metrics.cpuUsage)
      },
      alerts: this.generateAlerts()
    };
    
    // Save report
    const reportFile = path.join(__dirname, 'monitoring-reports', `performance-report-${Date.now()}.json`);
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Performance Report Generated:');
    console.log(`Average Response Time: ${report.summary.averageResponseTime.toFixed(2)}ms`);
    console.log(`Average Error Rate: ${(report.summary.averageErrorRate * 100).toFixed(2)}%`);
    console.log(`Average Memory Usage: ${(report.summary.averageMemoryUsage * 100).toFixed(2)}%`);
    console.log(`Average CPU Usage: ${(report.summary.averageCpuUsage * 100).toFixed(2)}%`);
    console.log(`Average RPS: ${report.summary.averageRPS.toFixed(2)}`);
    
    if (report.alerts.length > 0) {
      console.log('\n🚨 Alerts:');
      report.alerts.forEach(alert => console.log(`- ${alert}`));
    }
  }

  calculateAverage(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable';
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = this.calculateAverage(firstHalf);
    const secondAvg = this.calculateAverage(secondHalf);
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  generateAlerts() {
    const alerts = [];
    
    const avgResponseTime = this.calculateAverage(this.metrics.responseTimes);
    if (avgResponseTime > CONFIG.thresholds.responseTime) {
      alerts.push(`High average response time: ${avgResponseTime.toFixed(2)}ms`);
    }
    
    const avgErrorRate = this.calculateAverage(this.metrics.errorRates);
    if (avgErrorRate > CONFIG.thresholds.errorRate) {
      alerts.push(`High error rate: ${(avgErrorRate * 100).toFixed(2)}%`);
    }
    
    const avgMemory = this.calculateAverage(this.metrics.memoryUsage);
    if (avgMemory > CONFIG.thresholds.memoryUsage) {
      alerts.push(`High memory usage: ${(avgMemory * 100).toFixed(2)}%`);
    }
    
    const avgCpu = this.calculateAverage(this.metrics.cpuUsage);
    if (avgCpu > CONFIG.thresholds.cpuUsage) {
      alerts.push(`High CPU usage: ${(avgCpu * 100).toFixed(2)}%`);
    }
    
    return alerts;
  }

  stop() {
    this.isRunning = false;
    console.log('🛑 Performance monitoring stopped');
  }
}

// Start monitoring if run directly
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  
  // Generate report every 5 minutes
  setInterval(async () => {
    await monitor.generateReport();
  }, 300000);
  
  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down performance monitor...');
    await monitor.generateReport();
    monitor.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down performance monitor...');
    await monitor.generateReport();
    monitor.stop();
    process.exit(0);
  });
  
  // Start monitoring
  monitor.start();
}

module.exports = PerformanceMonitor;
