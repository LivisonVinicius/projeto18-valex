import { Pool } from 'pg';

const connection = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'valex',
  password: '00150808',
  port: 5432
})


export default connection;