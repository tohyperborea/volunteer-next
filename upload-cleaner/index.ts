import cron from 'node-cron';
import { Pool } from 'pg';
import fs from 'fs';
import fsPromise from 'fs/promises';
import path from 'path';

const readSecret = (name: string, defaultValue?: string): string => {
  const secretPath = path.join('/run/secrets', name);
  if (fs.existsSync(secretPath)) {
    return fs.readFileSync(secretPath, 'utf-8').trimEnd();
  }
  return process.env[name] || defaultValue || '';
};

const CRON_SCHEDULE = process.env.CRON_SCHEDULE || '0 0 * * *';
const POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
const POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
const POSTGRES_PASSWORD = readSecret('POSTGRES_PASSWORD', 'example');
const POSTGRES_DB = process.env.POSTGRES_DB || 'postgres';
const POSTGRES_PORT = Number(process.env.POSTGRES_PORT) || 5432;
const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(import.meta.dirname, '..', 'uploads');

console.log(`Upload Cleaner service started with schedule: ${CRON_SCHEDULE}`);
console.log(`Connecting to PostgreSQL at ${POSTGRES_HOST}:${POSTGRES_PORT} as ${POSTGRES_USER}...`);

const pool = new Pool({
  host: POSTGRES_HOST,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
  port: POSTGRES_PORT
});

console.log('Starting scheduled task...');

cron.schedule(CRON_SCHEDULE, async () => {
  try {
    // Remove any files in the /uploads folder that aren't referenced in the database
    const result = await pool.query(`SELECT logo, logo_dark, favicon FROM event`);
    const referencedFiles = new Set<string>(
      result.rows.flatMap((row) => {
        const files: string[] = [];
        if (row.logo) {
          files.push(row.logo);
        }
        if (row.logo_dark) {
          files.push(row.logo_dark);
        }
        if (row.favicon) {
          files.push(row.favicon);
        }
        return files;
      })
    );
    const files = await fsPromise.readdir(UPLOADS_DIR);
    console.log(
      `Found ${files.length} files in uploads directory, ${referencedFiles.size} are referenced in the database.`
    );
    await Promise.all(
      files.map((file) => {
        const filename = path.basename(file);
        const apiPath = `/api/image/${filename}`;
        if (!referencedFiles.has(apiPath)) {
          return deleteFile(path.join(UPLOADS_DIR, file));
        }
      })
    );
  } catch (error) {
    console.error('Error cleaning uploads:', error);
  }
});

const deleteFile = async (filePath: string) => {
  try {
    await fsPromise.unlink(filePath);
    console.log(`Deleted file: ${filePath}`);
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
};
