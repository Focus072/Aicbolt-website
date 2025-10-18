const fs = require('fs');
const path = require('path');

class DashboardGenerator {
  constructor() {
    this.reportsDir = path.join(__dirname, '..', 'monitoring-reports');
    this.dashboardDir = path.join(__dirname, '..', 'monitoring-dashboard');
  }

  async generateDashboard(healthResults, performanceResults, alertStats) {
    console.log('📊 Generating Monitoring Dashboard...');
    
    // Ensure dashboard directory exists
    if (!fs.existsSync(this.dashboardDir)) {
      fs.mkdirSync(this.dashboardDir, { recursive: true });
    }

    const dashboardHtml = this.generateDashboardHTML(healthResults, performanceResults, alertStats);
    const dashboardPath = path.join(this.dashboardDir, 'index.html');
    
    fs.writeFileSync(dashboardPath, dashboardHtml);
    console.log(`📊 Dashboard generated: ${dashboardPath}`);

    // Generate JSON data for API consumption
    const dashboardData = this.generateDashboardData(healthResults, performanceResults, alertStats);
    const dataPath = path.join(this.dashboardDir, 'dashboard-data.json');
    
    fs.writeFileSync(dataPath, JSON.stringify(dashboardData, null, 2));
    console.log(`📊 Dashboard data generated: ${dataPath}`);

    return dashboardPath;
  }

  generateDashboardHTML(healthResults, performanceResults, alertStats) {
    const timestamp = new Date().toISOString();
    const overallHealth = healthResults?.overall || 'unknown';
    const healthColor = overallHealth === 'healthy' ? '#28a745' : 
                       overallHealth === 'warning' ? '#ffc107' : '#dc3545';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Monitoring Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 1400px; 
            margin: 0 auto; 
            background: rgba(255, 255, 255, 0.95);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.2em; opacity: 0.9; }
        .status-bar {
            display: flex;
            justify-content: space-around;
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
        }
        .status-item {
            text-align: center;
            padding: 15px;
            border-radius: 10px;
            background: white;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            min-width: 150px;
        }
        .status-value {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .status-label {
            color: #6c757d;
            font-size: 0.9em;
        }
        .healthy { color: #28a745; }
        .warning { color: #ffc107; }
        .critical { color: #dc3545; }
        .content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            padding: 30px;
        }
        .card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border: 1px solid #e9ecef;
        }
        .card h3 {
            color: #495057;
            margin-bottom: 20px;
            font-size: 1.3em;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 10px;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f8f9fa;
        }
        .metric:last-child { border-bottom: none; }
        .metric-name { color: #6c757d; }
        .metric-value { font-weight: bold; }
        .alert {
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid;
        }
        .alert-critical {
            background: #f8d7da;
            border-left-color: #dc3545;
            color: #721c24;
        }
        .alert-warning {
            background: #fff3cd;
            border-left-color: #ffc107;
            color: #856404;
        }
        .chart-container {
            height: 300px;
            background: #f8f9fa;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6c757d;
            font-style: italic;
        }
        .footer {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            color: #6c757d;
            border-top: 1px solid #dee2e6;
        }
        @media (max-width: 768px) {
            .content { grid-template-columns: 1fr; }
            .status-bar { flex-direction: column; gap: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Website Monitoring Dashboard</h1>
            <p>Real-time health and performance monitoring</p>
            <p style="margin-top: 10px; font-size: 0.9em;">Last updated: ${new Date(timestamp).toLocaleString()}</p>
        </div>

        <div class="status-bar">
            <div class="status-item">
                <div class="status-value ${overallHealth}">${overallHealth.toUpperCase()}</div>
                <div class="status-label">Overall Health</div>
            </div>
            <div class="status-item">
                <div class="status-value">${healthResults?.checks?.length || 0}</div>
                <div class="status-label">Health Checks</div>
            </div>
            <div class="status-item">
                <div class="status-value">${healthResults?.alerts?.length || 0}</div>
                <div class="status-label">Active Alerts</div>
            </div>
            <div class="status-item">
                <div class="status-value">${alertStats?.last24h || 0}</div>
                <div class="status-label">Alerts (24h)</div>
            </div>
        </div>

        <div class="content">
            <div class="card">
                <h3>🔍 Health Status</h3>
                ${this.generateHealthMetrics(healthResults)}
            </div>

            <div class="card">
                <h3>🏃 Performance Metrics</h3>
                ${this.generatePerformanceMetrics(performanceResults)}
            </div>

            <div class="card">
                <h3>🚨 Active Alerts</h3>
                ${this.generateAlertsList(healthResults?.alerts || [])}
            </div>

            <div class="card">
                <h3>📊 System Resources</h3>
                ${this.generateSystemMetrics(performanceResults)}
            </div>

            <div class="card">
                <h3>📈 Performance Trends</h3>
                <div class="chart-container">
                    📊 Performance trend charts would be displayed here
                    <br><small>Integration with Chart.js or similar library recommended</small>
                </div>
            </div>

            <div class="card">
                <h3>📋 Alert Statistics</h3>
                ${this.generateAlertStats(alertStats)}
            </div>
        </div>

        <div class="footer">
            <p>🔄 Auto-refresh every 5 minutes | 📊 Generated by Website Monitoring System</p>
        </div>
    </div>

    <script>
        // Auto-refresh every 5 minutes
        setTimeout(() => {
            location.reload();
        }, 300000);

        // Add real-time updates here
        console.log('Dashboard loaded at', new Date().toISOString());
    </script>
</body>
</html>`;
  }

  generateHealthMetrics(healthResults) {
    if (!healthResults) return '<p>No health data available</p>';

    const checks = healthResults.checks || [];
    const healthyChecks = checks.filter(c => c.healthy).length;
    const totalChecks = checks.length;
    const successRate = totalChecks > 0 ? Math.round((healthyChecks / totalChecks) * 100) : 0;

    return `
        <div class="metric">
            <span class="metric-name">Success Rate</span>
            <span class="metric-value">${successRate}%</span>
        </div>
        <div class="metric">
            <span class="metric-name">Healthy Checks</span>
            <span class="metric-value">${healthyChecks}/${totalChecks}</span>
        </div>
        <div class="metric">
            <span class="metric-name">API Endpoints</span>
            <span class="metric-value">${checks.filter(c => c.url?.startsWith('/api')).length}</span>
        </div>
        <div class="metric">
            <span class="metric-name">Pages Monitored</span>
            <span class="metric-value">${checks.filter(c => c.url && !c.url.startsWith('/api')).length}</span>
        </div>
    `;
  }

  generatePerformanceMetrics(performanceResults) {
    if (!performanceResults) return '<p>No performance data available</p>';

    const apiMetrics = performanceResults.performance?.api || [];
    const dbMetrics = performanceResults.performance?.database || [];
    const pageMetrics = performanceResults.performance?.pages || [];

    const avgApiTime = apiMetrics.length > 0 ? 
      Math.round(apiMetrics.reduce((sum, m) => sum + (m.avgResponseTime || 0), 0) / apiMetrics.length) : 0;
    
    const avgDbTime = dbMetrics.length > 0 ? 
      Math.round(dbMetrics.reduce((sum, m) => sum + (m.avgQueryTime || 0), 0) / dbMetrics.length) : 0;
    
    const avgPageTime = pageMetrics.length > 0 ? 
      Math.round(pageMetrics.reduce((sum, m) => sum + (m.avgLoadTime || 0), 0) / pageMetrics.length) : 0;

    return `
        <div class="metric">
            <span class="metric-name">Avg API Response</span>
            <span class="metric-value">${avgApiTime}ms</span>
        </div>
        <div class="metric">
            <span class="metric-name">Avg DB Query</span>
            <span class="metric-value">${avgDbTime}ms</span>
        </div>
        <div class="metric">
            <span class="metric-name">Avg Page Load</span>
            <span class="metric-value">${avgPageTime}ms</span>
        </div>
        <div class="metric">
            <span class="metric-name">API Endpoints</span>
            <span class="metric-value">${apiMetrics.length}</span>
        </div>
    `;
  }

  generateAlertsList(alerts) {
    if (!alerts || alerts.length === 0) {
      return '<p style="color: #28a745; text-align: center; padding: 20px;">✅ No active alerts</p>';
    }

    return alerts.slice(0, 5).map(alert => `
        <div class="alert alert-${alert.severity}">
            <strong>${alert.severity.toUpperCase()}:</strong> ${alert.message}
            ${alert.endpoint ? `<br><small>Endpoint: ${alert.endpoint}</small>` : ''}
            ${alert.responseTime ? `<br><small>Response Time: ${alert.responseTime}ms</small>` : ''}
        </div>
    `).join('');
  }

  generateSystemMetrics(performanceResults) {
    if (!performanceResults?.performance?.system) {
      return '<p>No system data available</p>';
    }

    const system = performanceResults.performance.system;
    const memory = system.memory || {};
    const uptime = system.uptime || 0;
    const uptimeHours = Math.round(uptime / 3600);

    return `
        <div class="metric">
            <span class="metric-name">Memory Usage</span>
            <span class="metric-value">${memory.heapUsed || 0}MB</span>
        </div>
        <div class="metric">
            <span class="metric-name">Total Memory</span>
            <span class="metric-value">${memory.heapTotal || 0}MB</span>
        </div>
        <div class="metric">
            <span class="metric-name">Uptime</span>
            <span class="metric-value">${uptimeHours}h</span>
        </div>
        <div class="metric">
            <span class="metric-name">External Memory</span>
            <span class="metric-value">${memory.external || 0}MB</span>
        </div>
    `;
  }

  generateAlertStats(alertStats) {
    if (!alertStats) return '<p>No alert statistics available</p>';

    return `
        <div class="metric">
            <span class="metric-name">Total Alerts</span>
            <span class="metric-value">${alertStats.total || 0}</span>
        </div>
        <div class="metric">
            <span class="metric-name">Last 24h</span>
            <span class="metric-value">${alertStats.last24h || 0}</span>
        </div>
        <div class="metric">
            <span class="metric-name">Critical</span>
            <span class="metric-value">${alertStats.critical || 0}</span>
        </div>
        <div class="metric">
            <span class="metric-name">Warnings</span>
            <span class="metric-value">${alertStats.warning || 0}</span>
        </div>
    `;
  }

  generateDashboardData(healthResults, performanceResults, alertStats) {
    return {
      timestamp: new Date().toISOString(),
      overall: {
        health: healthResults?.overall || 'unknown',
        checks: healthResults?.checks?.length || 0,
        alerts: healthResults?.alerts?.length || 0
      },
      performance: {
        api: performanceResults?.performance?.api?.length || 0,
        database: performanceResults?.performance?.database?.length || 0,
        pages: performanceResults?.performance?.pages?.length || 0
      },
      alerts: alertStats || {},
      system: performanceResults?.performance?.system || {}
    };
  }
}

module.exports = DashboardGenerator;
