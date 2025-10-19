# AICBOLT Monitoring System

This directory contains the monitoring system for the AICBOLT website, including health checks, performance monitoring, and resilience testing.

## Files

- `health-check.js` - Monitors website uptime and sends alerts
- `resilience-test.js` - Tests system resilience by simulating API outages
- `performance-monitor.js` - Measures response times and generates reports

## Usage

### Local Development

```bash
# Run individual monitors
npm run monitor:health
npm run monitor:performance
npm run monitor:resilience

# Run all monitors
npm run monitor:all
```

### Environment Variables

Set these environment variables for email alerts:

```bash
ALERT_EMAIL=your-email@gmail.com
EMAIL_PASS=your-app-password
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### GitHub Actions

The monitoring system runs automatically via GitHub Actions:
- Every 15 minutes (scheduled)
- On every push to main
- Manual trigger available

## Reports

Performance reports are generated in the `monitoring-reports/` directory and uploaded as GitHub Actions artifacts.

## Email Alerts

Configure email alerts by setting the environment variables in your GitHub repository secrets:
- `ALERT_EMAIL` - Your email address
- `EMAIL_PASS` - App password for Gmail (or similar service)