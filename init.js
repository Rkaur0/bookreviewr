const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbFile = path.join(__dirname, 'data.sqlite');
const schemaPath = path.join(__dirname, 'db', 'schema.sql');
const seedPath = path.join(__dirname, 'db', 'seed.sql');

// Delete old DB
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
  console.log('🗑️ Deleted old database file.');
}

const db = new sqlite3.Database(dbFile);

function runSqlFromFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

(async () => {
  try {
    console.log('📜 Applying schema...');
    await runSqlFromFile(schemaPath);

    console.log('🌱 Seeding database...');
    await runSqlFromFile(seedPath);

    console.log('✅ Database initialized successfully!');
    db.close();
  } catch (err) {
    console.error('❌ Error initializing database:', err);
  }
})();
