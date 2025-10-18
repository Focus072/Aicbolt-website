# AICBOLT Monitoring System

A comprehensive monitoring and testing suite for the AICBOLT application, providing health checks, performance monitoring, resilience testing, and automated alerts.

## 🏥 Health Monitoring

### Health Check (`health-check.js`)
- **Purpose**: Continuous monitoring of application health
- **Features**:
  - Endpoint availability checks
  - Database connectivity monitoring
  - Response time tracking
  - Automated alerting via email and webhooks
  - Configurable failure thresholds

### Usage
```bash
# Run health monitoring
npm run monitor:health

# Or run directly
node monitoring/health-check.js
```

### Configuration
Set these environment variables:
```bash
APP_URL=http://localhost:3000
ALERT_EMAIL=admin@aicbolt.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
WEBHOOK_URL=https://hooks.slack.com/your-webhook
```

## 📊 Performance Monitoring

### Performance Monitor (`performance-monitor.js`)
- **Purpose**: Track application performance metrics
- **Features**:
  - Response time monitoring
  - Error rate tracking
  - Memory and CPU usage monitoring
  - Requests per second calculation
  - Performance trend analysis
  - Automated performance reports

### Usage
```bash
# Run performance monitoring
npm run monitor:performance

# Or run directly
node monitoring/performance-monitor.js
```

### Metrics Tracked
- **Response Time**: Average, min, max response times
- **Error Rate**: Percentage of failed requests
- **System Resources**: Memory and CPU usage
- **Throughput**: Requests per second
- **Trends**: Performance trend analysis

## 🧪 Resilience Testing

### Resilience Tester (`resilience-test.js`)
- **Purpose**: Test application stability under stress
- **Features**:
  - Load testing with concurrent users
  - Failure simulation (high latency, memory pressure, network issues)
  - Stress testing with increasing load
  - Recovery testing after failures
  - Comprehensive test reporting

### Usage
```bash
# Run resilience testing
npm run monitor:resilience

# Or run directly
node monitoring/resilience-test.js
```

### Test Scenarios
1. **Load Test**: Simulates multiple concurrent users
2. **Failure Simulation**: Tests application behavior under various failure conditions
3. **Stress Test**: Gradually increases load to find breaking points
4. **Recovery Test**: Verifies application recovery after failures

## 🔄 CI/CD Integration

### GitHub Actions Workflow
The monitoring system integrates with GitHub Actions for automated testing:

- **Health Check**: Runs on every push and PR
- **Performance Test**: Executes after successful health checks
- **Resilience Test**: Stress tests the application
- **Security Scan**: Audits dependencies and checks for secrets
- **Automated Reporting**: Generates comprehensive test reports

### Workflow Triggers
- Push to main/develop branches
- Pull requests
- Scheduled runs (every 6 hours)
- Manual dispatch

## 📈 Monitoring Reports

All monitoring results are saved to `monitoring-reports/` directory:

- `health-check.log`: Continuous health monitoring logs
- `performance.log`: Performance metrics over time
- `resilience-test-*.json`: Detailed resilience test results
- `performance-report-*.json`: Performance analysis reports

## 🚨 Alerting

### Email Alerts
- Sent when health checks fail consecutively
- Includes detailed error information
- Configurable alert cooldown periods

### Webhook Alerts
- Slack/Discord notifications
- Custom webhook endpoints
- Rich formatting with error details

### Alert Conditions
- **Health**: 3+ consecutive failures
- **Performance**: Response time > 2s, Error rate > 5%
- **Resources**: Memory > 80%, CPU > 80%

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env.local` with monitoring settings:
```bash
# Application
APP_URL=http://localhost:3000

# Email Alerts
ALERT_EMAIL=admin@aicbolt.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Webhook Alerts
WEBHOOK_URL=https://hooks.slack.com/your-webhook
```

### 3. Run Monitoring
```bash
# Run all monitoring
npm run monitor:all

# Run individual monitors
npm run monitor:health
npm run monitor:performance
npm run monitor:resilience

# Run comprehensive test suite
npm run test:monitoring
```

### 4. GitHub Actions Setup
1. Add secrets to your GitHub repository:
   - `ALERT_EMAIL`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `WEBHOOK_URL`

2. The workflow will automatically run on pushes and PRs

## 📊 Monitoring Dashboard

### Health Status
- ✅ **Healthy**: All systems operational
- ⚠️ **Warning**: Performance degradation detected
- 🚨 **Critical**: System failures detected

### Performance Metrics
- **Response Time**: Target < 2 seconds
- **Error Rate**: Target < 5%
- **Availability**: Target > 99.9%
- **Throughput**: Requests per second

### Resilience Metrics
- **Load Capacity**: Maximum concurrent users
- **Recovery Time**: Time to recover from failures
- **Failure Rate**: Percentage of failed operations
- **Stress Limits**: Breaking point identification

## 🔧 Customization

### Adding New Checks
1. Create new check function in `health-check.js`
2. Add to `performHealthCheck()` method
3. Update alert conditions as needed

### Custom Metrics
1. Add new metric collection in `performance-monitor.js`
2. Update `collectMetrics()` method
3. Add to report generation

### Custom Test Scenarios
1. Add new scenarios to `resilience-test.js`
2. Implement in `runFailureSimulation()`
3. Update test reporting

## 📝 Best Practices

### Monitoring
- Run health checks every 1-5 minutes
- Set appropriate alert thresholds
- Monitor key business metrics
- Track performance trends

### Testing
- Run resilience tests weekly
- Test under realistic load conditions
- Simulate real-world failure scenarios
- Document test results and improvements

### Alerting
- Use multiple alert channels (email + webhook)
- Set appropriate alert cooldowns
- Include actionable information in alerts
- Review and tune alert thresholds regularly

## 🆘 Troubleshooting

### Common Issues
1. **Health checks failing**: Check application is running and accessible
2. **Email alerts not working**: Verify SMTP credentials and settings
3. **Webhook alerts failing**: Check webhook URL and format
4. **Performance degradation**: Review application logs and system resources

### Debug Mode
Enable debug logging by setting:
```bash
DEBUG=monitoring:*
```

### Log Analysis
Check monitoring logs in `monitoring-reports/` for detailed information about failures and performance issues.

## 📚 Additional Resources

- [Monitoring Best Practices](https://docs.example.com/monitoring)
- [Performance Optimization Guide](https://docs.example.com/performance)
- [Resilience Testing Strategies](https://docs.example.com/resilience)
- [Alerting Configuration](https://docs.example.com/alerts)
