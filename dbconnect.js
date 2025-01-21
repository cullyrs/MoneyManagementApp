const { MongoClient, ServerApiVersion } = require('mongodb');
const { username, password } = require('./api.json');

const uri = `mongodb+srv://${username}:${password}@expensemanager1.3yfoo.mongodb.net/?retryWrites=true&w=majority&appName=ExpenseManager1`;

let client;
let db;

async function connectToDB() {
  if (!client) {
    // Add tls: true if your deployment specifically needs TLS forced:
    // For example: { tls: true, ssl: true, ... }
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });
  }

  if (!client.topology || !client.topology.isConnected()) {
    try {
      // Attempt to connect to MongoDB
      await client.connect();
      console.log('Connected to MongoDB!');

      await client.db('admin').command({ ping: 1 });
      console.log('Pinged your deployment. Connection is successful!');

      db = client.db('Accounts');
    } catch (err) {
      console.error('Failed to connect to MongoDB:', err);
      throw err;
    }
  }

  return db; 
}

function getDB() {
  if (!db) {
    throw new Error('DB not connected yet. Call connectToDB() first.');
  }
  return db;
}

module.exports = {
  connectToDB,
  getDB
};
