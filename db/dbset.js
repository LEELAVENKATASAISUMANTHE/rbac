import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
  // increase connection timeout to 5000ms to reduce transient failures
  connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
});

export const getclient = async () => {
   try {
       const client = await pool.connect();
       return client;
   } catch (error) {
     console.log("error getting a client from the pool", error);
     throw error;
   }
};

export const dbtestrun = async () => {
    const client = await getclient();
   try {
       const result = await client.query('SELECT NOW()');
       console.log("Current time:", result.rows[0]);
   } catch (error) {
       console.error("Error running test query:", error);
   } finally {
       client.release();
   }
};
export const dbhealth = async () => {
    const client = await getclient();
    try {
    await client.query('BEGIN READ ONLY');

    // 1️⃣ Total connections (all users)
    const totalConnections = await client.query(`
      SELECT count(*) AS total
      FROM pg_stat_activity;
    `);

    // 2️⃣ Details about every connection
    const connectionDetails = await client.query(`
      SELECT pid,
             usename,
             client_addr,
             application_name,
             state,
             backend_start,
             query
      FROM pg_stat_activity
      ORDER BY backend_start DESC;
    `);

    // 3️⃣ Active vs idle connections
    const stateSummary = await client.query(`
      SELECT state, count(*) AS count
      FROM pg_stat_activity
      GROUP BY state;
    `);

    // 4️⃣ Max allowed connections
    const maxConnections = await client.query(`SHOW max_connections;`);

    // 5️⃣ Remaining slots
    const freeSlots = await client.query(`
      SELECT
        (SELECT setting::int
           FROM pg_settings
          WHERE name = 'max_connections')
        - count(*) AS free_slots
      FROM pg_stat_activity;
    `);

    await client.query('COMMIT');

    return {
      totalConnections: totalConnections.rows[0].total,
      connectionDetails: connectionDetails.rows,
      stateSummary: stateSummary.rows,
      maxConnections: maxConnections.rows[0].max_connections,
      freeSlots: freeSlots.rows[0].free_slots,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

};



 
