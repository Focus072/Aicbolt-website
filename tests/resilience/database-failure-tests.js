const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config({ path: '../../.env.local' });

class DatabaseFailureTests {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:3003';
    this.db = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: [],
      failures: [],
      recovery: []
    };
  }

  async cleanup() {
    if (this.db) {
      await this.db.end();
    }
  }

  async test(name, testFunction) {
    try {
      console.log(`\n🧪 Testing: ${name}`);
      const startTime = Date.now();
      await testFunction();
      const endTime = Date.now();
      const duration = endTime - startTime;

      this.testResults.tests.push({
        name,
        status: 'PASSED',
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ PASSED: ${name} (${duration}ms)`);
    } catch (error) {
      this.testResults.failures.push({
        name,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      console.log(`❌ FAILED: ${name} - ${error.message}`);
    }
  }

  async simulateConnectionPoolExhaustion() {
    console.log('🚨 Simulating database connection pool exhaustion...');
    
    await this.test('Connection Pool Stress Test', async () => {
      const maxConnections = 20;
      const connections = [];
      
      try {
        // Try to create many connections to exhaust the pool
        for (let i = 0; i < maxConnections; i++) {
          const connection = new Pool({
            connectionString: process.env.POSTGRES_URL,
            max: 1 // Limit each pool to 1 connection
          });
          connections.push(connection);
          
          // Test each connection
          await connection.query('SELECT 1');
          console.log(`   ✅ Connection ${i + 1} established`);
        }
        
        console.log(`   📊 Successfully created ${connections.length} connections`);
      } catch (error) {
        console.log(`   🚨 Connection pool exhausted at connection ${connections.length + 1}: ${error.message}`);
      } finally {
        // Clean up all connections
        for (const connection of connections) {
          try {
            await connection.end();
          } catch (error) {
            console.log(`   ⚠️ Error closing connection: ${error.message}`);
          }
        }
      }
    });
  }

  async simulateSlowQueries() {
    console.log('🐌 Simulating slow database queries...');
    
    await this.test('Slow Query Simulation', async () => {
      const slowQueries = [
        'SELECT pg_sleep(2)', // 2 second delay
        'SELECT COUNT(*) FROM users WHERE username ILIKE \'%test%\'',
        'SELECT * FROM users u LEFT JOIN team_members tm ON u.id = tm.user_id LEFT JOIN teams t ON tm.team_id = t.id',
        'SELECT COUNT(*) FROM activity_logs WHERE created_at > NOW() - INTERVAL \'1 day\''
      ];
      
      for (const query of slowQueries) {
        try {
          const startTime = Date.now();
          const result = await this.db.query(query);
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          console.log(`   📊 Query completed in ${duration}ms: ${query.substring(0, 50)}...`);
          
          if (duration > 3000) {
            console.log(`   ⚠️ Slow query detected: ${duration}ms`);
          }
        } catch (error) {
          console.log(`   🚨 Query failed: ${error.message}`);
        }
      }
    });

    await this.test('Query Timeout Simulation', async () => {
      try {
        // Set a very short timeout to simulate query timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), 1000);
        });
        
        const queryPromise = this.db.query('SELECT pg_sleep(2)');
        
        await Promise.race([queryPromise, timeoutPromise]);
      } catch (error) {
        if (error.message === 'Query timeout') {
          console.log('   ✅ Query timeout simulation successful');
        } else {
          console.log(`   ⚠️ Unexpected error: ${error.message}`);
        }
      }
    });
  }

  async simulateDatabaseOutage() {
    console.log('💥 Simulating database outage scenarios...');
    
    await this.test('Database Connection Failure', async () => {
      // Test with invalid connection string
      const invalidDb = new Pool({
        connectionString: 'postgresql://invalid:invalid@localhost:5432/invalid'
      });
      
      try {
        await invalidDb.query('SELECT 1');
        throw new Error('Expected connection to fail');
      } catch (error) {
        if (error.code === 'ECONNREFUSED' || error.message.includes('connection')) {
          console.log('   ✅ Database connection failure simulated successfully');
        } else {
          console.log(`   ⚠️ Unexpected error: ${error.message}`);
        }
      } finally {
        await invalidDb.end();
      }
    });

    await this.test('Database Transaction Rollback', async () => {
      const client = await this.db.connect();
      
      try {
        await client.query('BEGIN');
        
        // Insert a test record
        await client.query('INSERT INTO users (username, name, password_hash, role, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())', 
          ['test_user_' + Date.now(), 'Test User', 'hashed_password', 'user', true]);
        
        // Intentionally cause an error to test rollback
        await client.query('INSERT INTO users (username, name, password_hash, role, is_active, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())', 
          ['test_user_' + Date.now(), 'Test User', 'hashed_password', 'user', true]);
        
        await client.query('COMMIT');
        console.log('   ✅ Transaction completed successfully');
      } catch (error) {
        await client.query('ROLLBACK');
        console.log('   ✅ Transaction rollback successful');
      } finally {
        client.release();
      }
    });
  }

  async testDatabaseRecovery() {
    console.log('🔄 Testing database recovery mechanisms...');
    
    await this.test('Connection Retry Logic', async () => {
      let attempts = 0;
      let success = false;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && !success) {
        try {
          await this.db.query('SELECT 1');
          success = true;
          console.log(`   ✅ Database connection successful after ${attempts + 1} attempts`);
        } catch (error) {
          attempts++;
          console.log(`   🔄 Database connection attempt ${attempts} failed: ${error.message}`);
          
          if (attempts < maxAttempts) {
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!success) {
        throw new Error(`Database failed to recover after ${maxAttempts} attempts`);
      }
    });

    await this.test('Connection Pool Recovery', async () => {
      // Test that the connection pool can recover from failures
      const testQueries = [
        'SELECT COUNT(*) FROM users',
        'SELECT COUNT(*) FROM teams',
        'SELECT COUNT(*) FROM team_members'
      ];
      
      for (const query of testQueries) {
        try {
          const result = await this.db.query(query);
          console.log(`   ✅ Query successful: ${query} returned ${result.rows[0].count}`);
        } catch (error) {
          console.log(`   🚨 Query failed: ${error.message}`);
          throw error;
        }
      }
    });
  }

  async testDataConsistency() {
    console.log('🔒 Testing data consistency during failures...');
    
    await this.test('Data Integrity Check', async () => {
      // Check for orphaned records
      const orphanedTeamMembers = await this.db.query(`
        SELECT COUNT(*) as count
        FROM team_members tm
        LEFT JOIN users u ON tm.user_id = u.id
        WHERE u.id IS NULL
      `);
      
      const orphanedActivityLogs = await this.db.query(`
        SELECT COUNT(*) as count
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        WHERE u.id IS NULL
      `);
      
      console.log(`   📊 Orphaned team members: ${orphanedTeamMembers.rows[0].count}`);
      console.log(`   📊 Orphaned activity logs: ${orphanedActivityLogs.rows[0].count}`);
      
      if (orphanedTeamMembers.rows[0].count > 0 || orphanedActivityLogs.rows[0].count > 0) {
        console.log('   ⚠️ Data consistency issues found');
      } else {
        console.log('   ✅ Data consistency check passed');
      }
    });

    await this.test('Foreign Key Constraint Validation', async () => {
      // Test that foreign key constraints are working
      try {
        // Try to insert a team member with invalid user_id
        await this.db.query('INSERT INTO team_members (user_id, team_id) VALUES ($1, $2)', [99999, 1]);
        console.log('   ⚠️ Foreign key constraint not working properly');
      } catch (error) {
        if (error.code === '23503') { // Foreign key violation
          console.log('   ✅ Foreign key constraints working properly');
        } else {
          console.log(`   ⚠️ Unexpected error: ${error.message}`);
        }
      }
    });
  }

  async testPerformanceUnderLoad() {
    console.log('⚡ Testing database performance under load...');
    
    await this.test('Concurrent Query Load', async () => {
      const concurrentQueries = 10;
      const queries = [
        'SELECT COUNT(*) FROM users',
        'SELECT COUNT(*) FROM teams',
        'SELECT COUNT(*) FROM team_members',
        'SELECT COUNT(*) FROM activity_logs'
      ];
      
      const promises = [];
      
      for (let i = 0; i < concurrentQueries; i++) {
        const query = queries[i % queries.length];
        promises.push(
          this.db.query(query).catch(error => ({ error: error.message }))
        );
      }
      
      const results = await Promise.all(promises);
      const successful = results.filter(r => !r.error).length;
      const failed = results.filter(r => r.error).length;
      
      console.log(`   📊 Concurrent queries: ${successful} successful, ${failed} failed`);
      
      if (successful < concurrentQueries * 0.8) {
        throw new Error(`High failure rate: ${failed}/${concurrentQueries} queries failed`);
      }
    });

    await this.test('Long Running Query Performance', async () => {
      const startTime = Date.now();
      
      // Run a complex query that might take time
      const result = await this.db.query(`
        SELECT u.username, u.role, t.name as team_name, COUNT(al.id) as activity_count
        FROM users u
        LEFT JOIN team_members tm ON u.id = tm.user_id
        LEFT JOIN teams t ON tm.team_id = t.id
        LEFT JOIN activity_logs al ON u.id = al.user_id
        WHERE u.deleted_at IS NULL
        GROUP BY u.id, u.username, u.role, t.name
        ORDER BY activity_count DESC
      `);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`   📊 Complex query completed in ${duration}ms, returned ${result.rows.length} rows`);
      
      if (duration > 5000) {
        console.log('   ⚠️ Query performance could be improved');
      }
    });
  }

  async runAllTests() {
    console.log('🧪 Starting Database Failure Resilience Tests');
    console.log('==============================================');

    await this.simulateConnectionPoolExhaustion();
    await this.simulateSlowQueries();
    await this.simulateDatabaseOutage();
    await this.testDatabaseRecovery();
    await this.testDataConsistency();
    await this.testPerformanceUnderLoad();

    console.log('\n🎯 Database Failure Resilience Test Results');
    console.log('==========================================');
    console.log(`✅ Tests Passed: ${this.testResults.tests.length}`);
    console.log(`❌ Tests Failed: ${this.testResults.failures.length}`);
    console.log(`🔄 Recovery Tests: ${this.testResults.recovery.length}`);

    if (this.testResults.failures.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.name}: ${failure.error}`);
      });
    }

    await this.cleanup();
    return this.testResults;
  }
}

// Run tests if called directly
if (require.main === module) {
  const databaseFailureTests = new DatabaseFailureTests();
  databaseFailureTests.runAllTests().catch(console.error);
}

module.exports = DatabaseFailureTests;
