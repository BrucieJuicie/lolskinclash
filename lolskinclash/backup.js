// lolskinclash\backup.js
const fs = require('fs'); //
const path = require('path'); //
const mongoose = require('mongoose'); //
require('dotenv').config({ path: '.env.local' }); //

const MONGO_URI = process.env.MONGODB_URI; // [cite: 229]

// Define a generic schema that can be used for any collection
const genericSchema = new mongoose.Schema({}, { strict: false }); // [cite: 230]

async function backupCollection(collectionName, modelName) {
  try {
    console.log(`Starting backup for collection: ${collectionName}...`);
    // Use a new model name for each collection to avoid Mongoose OverwriteModelError
    const Model = mongoose.models[modelName] || mongoose.model(modelName, genericSchema, collectionName);
    
    const data = await Model.find({}); // [cite: 232]
    if (data.length === 0) {
      console.log(`No data found in collection: ${collectionName}. Skipping backup for this collection.`);
      return;
    }

    const timestamp = new Date().toISOString().replace(/:/g, '-').slice(0, 19); // YYYY-MM-DDTHH-MM-SS
    const backupDir = path.join(__dirname, 'backups'); // Store backups in a 'backups' subdirectory
    const filePath = path.join(backupDir, `backup_${collectionName}_${timestamp}.json`);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2)); // [cite: 232]
    console.log(`✅ Collection '${collectionName}' backed up successfully to ${filePath}`); // [cite: 233]

  } catch (err) {
    console.error(`❌ Backup failed for collection '${collectionName}':`, err.message, err.stack); //
    throw err; // Re-throw error to be caught by the main backup process
  }
}

async function performAllBackups() {
  if (!MONGO_URI) { //
    console.error('❌ MONGODB_URI is not defined in .env.local. Backup process cannot start.'); //
    process.exit(1); //
  }

  try {
    await mongoose.connect(MONGO_URI); //
    console.log('Successfully connected to MongoDB for backup.');

    // Specify the collections you want to back up and their model names (can be same as collection name if simple)
    const collectionsToBackup = [
      { collectionName: 'skins', modelName: 'SkinBackup' }, // Use distinct model names
      { collectionName: 'users', modelName: 'UserBackup' },
      { collectionName: 'riftposts', modelName: 'RiftPostBackup' },
      // Add other collections as needed
    ];

    for (const { collectionName, modelName } of collectionsToBackup) {
      await backupCollection(collectionName, modelName);
    }

    console.log('All specified collections backed up.');
  
  } catch (err) {
    console.error('❌ Overall backup process failed:', err.message); //
    // process.exit(1) will be handled by individual backupCollection failures if they re-throw
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0); // Exit successfully if all backups attempted (errors are logged)
  }
}

// Run the backup process
performAllBackups();