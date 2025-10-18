module.exports = {
  // Health Check Configuration
  healthCheck: {
    interval: 5 * 60 * 1000, // 5 minutes
    timeout: 10000, // 10 seconds
    retries: 3,
    endpoints: [
      { url: '/api/user', name: 'User API', critical: true },
      { url: '/api/dashboard', name: 'Dashboard API', critical: true },
      { url: '/api/users', name: 'Users API', critical: false },
      { url: '/api/clients', name: 'Clients API', critical: true },
      { url: '/api/projects', name: 'Projects API', critical: true }
    ],
    pages: [
      { url: '/', name: 'Homepage', critical: true },
      { url: '/sign-in', name: 'Sign In', critical: true },
      { url: '/profit-plan', name: 'Profit Plan', critical: false },
      { url: '/dashboard', name: 'Dashboard', critical: true }
    ]
  },

  // Performance Monitoring Configuration
  performance: {
    interval: 10 * 60 * 1000, // 10 minutes
    measurements: 3, // Number of measurements per endpoint
    thresholds: {
      apiResponseTime: 3000, // 3 seconds
      databaseQueryTime: 2000, // 2 seconds
      pageLoadTime: 5000, // 5 seconds
      memoryUsage: 0.9 // 90%
    }
  },

  // Alert Configuration
  alerts: {
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
    },
    cooldown: {
      critical: 15 * 60 * 1000, // 15 minutes
      warning: 60 * 60 * 1000 // 1 hour
    }
  },

  // Resilience Testing Configuration
  resilience: {
    apiFailure: {
      enabled: true,
      interval: 24 * 60 * 60 * 1000, // 24 hours
      scenarios: [
        'slow_response',
        'error_responses',
        'network_issues',
        'timeout_simulation'
      ]
    },
    databaseFailure: {
      enabled: true,
      interval: 24 * 60 * 60 * 1000, // 24 hours
      scenarios: [
        'connection_pool_exhaustion',
        'slow_queries',
        'connection_failures',
        'transaction_rollback'
      ]
    },
    loadStress: {
      enabled: true,
      interval: 12 * 60 * 60 * 1000, // 12 hours
      scenarios: [
        'concurrent_users',
        'high_traffic',
        'database_load',
        'memory_stress',
        'network_issues'
      ]
    },
    recovery: {
      enabled: true,
      interval: 24 * 60 * 60 * 1000, // 24 hours
      scenarios: [
        'auto_recovery',
        'graceful_degradation',
        'data_consistency',
        'session_recovery',
        'performance_recovery'
      ]
    }
  },

  // Dashboard Configuration
  dashboard: {
    autoRefresh: 5 * 60 * 1000, // 5 minutes
    historyRetention: 7 * 24 * 60 * 60 * 1000, // 7 days
    charts: {
      enabled: true,
      timeRange: 24 * 60 * 60 * 1000, // 24 hours
      dataPoints: 100
    }
  },

  // Monitoring Reports Configuration
  reports: {
    directory: './monitoring-reports',
    retention: 30 * 24 * 60 * 60 * 1000, // 30 days
    formats: ['json', 'html', 'markdown'],
    compression: true
  },

  // CI/CD Integration
  cicd: {
    enabled: process.env.CI === 'true',
    githubActions: {
      enabled: process.env.GITHUB_ACTIONS === 'true',
      workflow: '.github/workflows/monitoring.yml'
    },
    vercel: {
      enabled: process.env.VERCEL === 'true',
      preview: process.env.VERCEL_ENV === 'preview'
    }
  },

  // Environment Configuration
  environment: {
    development: {
      healthCheckInterval: 2 * 60 * 1000, // 2 minutes
      performanceInterval: 5 * 60 * 1000, // 5 minutes
      alertCooldown: 5 * 60 * 1000 // 5 minutes
    },
    production: {
      healthCheckInterval: 5 * 60 * 1000, // 5 minutes
      performanceInterval: 10 * 60 * 1000, // 10 minutes
      alertCooldown: 15 * 60 * 1000 // 15 minutes
    }
  }
};
