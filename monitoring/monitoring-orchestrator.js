const HealthChecker = require('./health-checker');
const PerformanceMonitor = require('./performance-monitor');
const AlertManager = require('./alert-manager');
const DashboardGenerator = require('./dashboard-generator');
const config = require('../config/monitoring-config');

class MonitoringOrchestrator {
  constructor() {
    this.healthChecker = new HealthChecker();
    this.performanceMonitor = new PerformanceMonitor();
    this.alertManager = new AlertManager();
    this.dashboardGenerator = new DashboardGenerator();
    this.isRunning = false;
    this.intervals = [];
  }

  async startMonitoring() {
    if (this.isRunning) {
      console.log('⚠️ Monitoring is already running');
      return;
    }

    console.log('🚀 Starting Monitoring Orchestrator...');
    console.log('=====================================');

    this.isRunning = true;

    // Start health checks
    this.startHealthChecks();
    
    // Start performance monitoring
    this.startPerformanceMonitoring();
    
    // Start resilience testing
    this.startResilienceTesting();
    
    // Start dashboard generation
    this.startDashboardGeneration();

    console.log('✅ Monitoring Orchestrator started successfully');
    console.log('📊 Health checks: Every 5 minutes');
    console.log('🏃 Performance monitoring: Every 10 minutes');
    console.log('🧪 Resilience testing: Daily at 2 AM');
    console.log('📈 Dashboard generation: Every 30 minutes');
  }

  startHealthChecks() {
    const interval = config.healthCheck.interval;
    
    const runHealthCheck = async () => {
      try {
        console.log('\n🔍 Running Health Check...');
        const results = await this.healthChecker.runAllChecks();
        await this.healthChecker.saveResults();
        
        // Process alerts
        if (results.alerts && results.alerts.length > 0) {
          await this.alertManager.processAlerts(results.alerts);
        }
        
        console.log('✅ Health check completed');
      } catch (error) {
        console.error('❌ Health check failed:', error.message);
      }
    };

    // Run immediately
    runHealthCheck();
    
    // Then run on interval
    const healthInterval = setInterval(runHealthCheck, interval);
    this.intervals.push(healthInterval);
  }

  startPerformanceMonitoring() {
    const interval = config.performance.interval;
    
    const runPerformanceMonitoring = async () => {
      try {
        console.log('\n🏃 Running Performance Monitoring...');
        const results = await this.performanceMonitor.runPerformanceMonitoring();
        await this.performanceMonitor.saveMetrics();
        
        // Process alerts
        if (results.alerts && results.alerts.length > 0) {
          await this.alertManager.processAlerts(results.alerts);
        }
        
        console.log('✅ Performance monitoring completed');
      } catch (error) {
        console.error('❌ Performance monitoring failed:', error.message);
      }
    };

    // Run immediately
    runPerformanceMonitoring();
    
    // Then run on interval
    const performanceInterval = setInterval(runPerformanceMonitoring, interval);
    this.intervals.push(performanceInterval);
  }

  startResilienceTesting() {
    const interval = config.resilience.apiFailure.interval;
    
    const runResilienceTests = async () => {
      try {
        console.log('\n🧪 Running Resilience Tests...');
        
        // Run API failure tests
        if (config.resilience.apiFailure.enabled) {
          const ApiFailureTests = require('../tests/resilience/api-failure-tests');
          const apiTests = new ApiFailureTests();
          await apiTests.runAllTests();
        }
        
        // Run database failure tests
        if (config.resilience.databaseFailure.enabled) {
          const DatabaseFailureTests = require('../tests/resilience/database-failure-tests');
          const dbTests = new DatabaseFailureTests();
          await dbTests.runAllTests();
        }
        
        // Run load stress tests
        if (config.resilience.loadStress.enabled) {
          const LoadStressTests = require('../tests/resilience/load-stress-tests');
          const loadTests = new LoadStressTests();
          await loadTests.runAllTests();
        }
        
        // Run recovery tests
        if (config.resilience.recovery.enabled) {
          const RecoveryTests = require('../tests/resilience/recovery-tests');
          const recoveryTests = new RecoveryTests();
          await recoveryTests.runAllTests();
        }
        
        console.log('✅ Resilience tests completed');
      } catch (error) {
        console.error('❌ Resilience tests failed:', error.message);
      }
    };

    // Run immediately
    runResilienceTests();
    
    // Then run on interval
    const resilienceInterval = setInterval(runResilienceTests, interval);
    this.intervals.push(resilienceInterval);
  }

  startDashboardGeneration() {
    const interval = 30 * 60 * 1000; // 30 minutes
    
    const generateDashboard = async () => {
      try {
        console.log('\n📊 Generating Dashboard...');
        
        // Get latest health results
        const healthResults = await this.getLatestHealthResults();
        
        // Get latest performance results
        const performanceResults = await this.getLatestPerformanceResults();
        
        // Get alert statistics
        const alertStats = this.alertManager.getAlertStats();
        
        // Generate dashboard
        await this.dashboardGenerator.generateDashboard(
          healthResults,
          performanceResults,
          alertStats
        );
        
        console.log('✅ Dashboard generated');
      } catch (error) {
        console.error('❌ Dashboard generation failed:', error.message);
      }
    };

    // Run immediately
    generateDashboard();
    
    // Then run on interval
    const dashboardInterval = setInterval(generateDashboard, interval);
    this.intervals.push(dashboardInterval);
  }

  async getLatestHealthResults() {
    try {
      const fs = require('fs');
      const path = require('path');
      const reportsDir = path.join(__dirname, '..', 'monitoring-reports');
      
      if (!fs.existsSync(reportsDir)) {
        return null;
      }
      
      const files = fs.readdirSync(reportsDir)
        .filter(file => file.startsWith('health-check-') && file.endsWith('.json'))
        .sort()
        .reverse();
      
      if (files.length === 0) {
        return null;
      }
      
      const latestFile = files[0];
      const filePath = path.join(reportsDir, latestFile);
      const content = fs.readFileSync(filePath, 'utf8');
      
      return JSON.parse(content);
    } catch (error) {
      console.error('Error getting latest health results:', error.message);
      return null;
    }
  }

  async getLatestPerformanceResults() {
    try {
      const fs = require('fs');
      const path = require('path');
      const reportsDir = path.join(__dirname, '..', 'monitoring-reports');
      
      if (!fs.existsSync(reportsDir)) {
        return null;
      }
      
      const files = fs.readdirSync(reportsDir)
        .filter(file => file.startsWith('performance-metrics-') && file.endsWith('.json'))
        .sort()
        .reverse();
      
      if (files.length === 0) {
        return null;
      }
      
      const latestFile = files[0];
      const filePath = path.join(reportsDir, latestFile);
      const content = fs.readFileSync(filePath, 'utf8');
      
      return JSON.parse(content);
    } catch (error) {
      console.error('Error getting latest performance results:', error.message);
      return null;
    }
  }

  async stopMonitoring() {
    if (!this.isRunning) {
      console.log('⚠️ Monitoring is not running');
      return;
    }

    console.log('🛑 Stopping Monitoring Orchestrator...');
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    this.isRunning = false;
    
    // Cleanup resources
    await this.healthChecker.cleanup();
    await this.performanceMonitor.cleanup();
    
    console.log('✅ Monitoring Orchestrator stopped');
  }

  async runSingleHealthCheck() {
    console.log('🔍 Running Single Health Check...');
    const results = await this.healthChecker.runAllChecks();
    await this.healthChecker.saveResults();
    
    if (results.alerts && results.alerts.length > 0) {
      await this.alertManager.processAlerts(results.alerts);
    }
    
    return results;
  }

  async runSinglePerformanceCheck() {
    console.log('🏃 Running Single Performance Check...');
    const results = await this.performanceMonitor.runPerformanceMonitoring();
    await this.performanceMonitor.saveMetrics();
    
    if (results.alerts && results.alerts.length > 0) {
      await this.alertManager.processAlerts(results.alerts);
    }
    
    return results;
  }

  async runSingleResilienceTest() {
    console.log('🧪 Running Single Resilience Test...');
    
    const results = {
      timestamp: new Date().toISOString(),
      tests: [],
      failures: []
    };
    
    try {
      // Run all resilience tests
      const ApiFailureTests = require('../tests/resilience/api-failure-tests');
      const DatabaseFailureTests = require('../tests/resilience/database-failure-tests');
      const LoadStressTests = require('../tests/resilience/load-stress-tests');
      const RecoveryTests = require('../tests/resilience/recovery-tests');
      
      const apiTests = new ApiFailureTests();
      const dbTests = new DatabaseFailureTests();
      const loadTests = new LoadStressTests();
      const recoveryTests = new RecoveryTests();
      
      const apiResults = await apiTests.runAllTests();
      const dbResults = await dbTests.runAllTests();
      const loadResults = await loadTests.runAllTests();
      const recoveryResults = await recoveryTests.runAllTests();
      
      results.tests = [
        ...apiResults.tests,
        ...dbResults.tests,
        ...loadResults.tests,
        ...recoveryResults.tests
      ];
      
      results.failures = [
        ...apiResults.failures,
        ...dbResults.failures,
        ...loadResults.failures,
        ...recoveryResults.failures
      ];
      
      console.log('✅ Resilience test completed');
    } catch (error) {
      console.error('❌ Resilience test failed:', error.message);
      results.failures.push({
        name: 'Resilience Test Orchestration',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    
    return results;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      intervals: this.intervals.length,
      config: config
    };
  }
}

// Run orchestrator if called directly
if (require.main === module) {
  const orchestrator = new MonitoringOrchestrator();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await orchestrator.stopMonitoring();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await orchestrator.stopMonitoring();
    process.exit(0);
  });
  
  // Start monitoring
  orchestrator.startMonitoring().catch(console.error);
}

module.exports = MonitoringOrchestrator;
