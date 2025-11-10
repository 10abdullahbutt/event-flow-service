/**
 * Test PostgreSQL connection script
 * Run with: node test-db-connection.js
 */

const { Client } = require('pg');

// Get connection settings from environment or use defaults
const config = {
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'postgres', // Try 'postgres' first, then 'audit_db'
};

console.log('Testing PostgreSQL connection...');
console.log('Configuration:', {
  host: config.host,
  port: config.port,
  user: config.user,
  database: config.database,
  password: '***',
});

const client = new Client(config);

client
  .connect()
  .then(() => {
    console.log('✅ Successfully connected to PostgreSQL!');
    return client.query('SELECT version()');
  })
  .then((result) => {
    console.log('PostgreSQL version:', result.rows[0].version);
    return client.query('SELECT current_database(), current_user');
  })
  .then((result) => {
    console.log('Current database:', result.rows[0].current_database);
    console.log('Current user:', result.rows[0].current_user);
    return client.query("SELECT datname FROM pg_database WHERE datname = 'audit_db'");
  })
  .then((result) => {
    if (result.rows.length > 0) {
      console.log('✅ Database "audit_db" exists');
    } else {
      console.log('⚠️  Database "audit_db" does not exist. It will be created automatically.');
    }
    client.end();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed!');
    console.error('Error:', err.message);
    console.error('\nTroubleshooting tips:');
    console.error('1. Check if PostgreSQL is running');
    console.error('2. Verify the port (EnterpriseDB might use a different port)');
    console.error('3. Check username and password');
    console.error('4. Try connecting with: psql -h localhost -p 5432 -U postgres');
    console.error('\nCommon EnterpriseDB ports: 5432, 5433, 5444');
    console.error('Common EnterpriseDB default user: postgres, enterprisedb, edb');
    process.exit(1);
  });

