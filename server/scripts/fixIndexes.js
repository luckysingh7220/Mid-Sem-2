/**
 * One-time migration: drops the stale `username_1` unique index
 * left over from an older schema.
 *
 * Run once:  node scripts/fixIndexes.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    const collection = mongoose.connection.collection('users');

    // List current indexes so we can see what's there
    const indexes = await collection.indexes();
    console.log('\nExisting indexes on users collection:');
    indexes.forEach((idx) => console.log(' -', idx.name, JSON.stringify(idx.key)));

    // Drop the stale username_1 index if it exists
    const hasUsername = indexes.some((i) => i.name === 'username_1');
    if (hasUsername) {
      await collection.dropIndex('username_1');
      console.log('\n✅ Dropped stale index: username_1');
    } else {
      console.log('\nℹ️  Index username_1 not found — nothing to drop');
    }

    await mongoose.disconnect();
    console.log('✅ Done — you can now register new users normally.');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

main();
