import fs from 'fs';
import path from 'path';
import { getclient } from '../db/dbset.js';
import { handlePostgresError } from '../utils/postgresErrorHandler.js';

const apiDocsPath = path.resolve(process.cwd(), 'api_docs.md');

function readApiDocs(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => line.replace(/^->\s*/, ''));
}

async function seedPermissions() {
  let perms;
  try {
    perms = readApiDocs(apiDocsPath);
  } catch (err) {
    console.error('Could not read api_docs.md at', apiDocsPath, err.message);
    process.exit(1);
  }

  const client = await getclient();
  try {
    await client.query('BEGIN');
    const insertText = 'INSERT INTO permissions (name, description) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING RETURNING *';
    for (const name of perms) {
      const description = `Auto-seeded permission: ${name}`;
      try {
        await client.query(insertText, [name, description]);
        console.log('Upserted permission:', name);
      } catch (err) {
        console.error('Error inserting permission', name, err.message);
      }
    }
    await client.query('COMMIT');
    console.log('\nSeeding complete.');
  } catch (error) {
    await client.query('ROLLBACK');
    handlePostgresError(error);
    process.exit(1);
  } finally {
    client.release();
  }
}

seedPermissions().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
