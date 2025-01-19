// db/connect.js
const { MongoClient, ServerApiVersion } = require('mongodb');

// Put your actual connection string here
// Make sure to replace <db_password> if it's still in the string
const uri = "mongodb+srv://cullyrs09:<db_password>@cluster0.fao8l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// We'll keep a reference to the client and DB so we can reuse them
let client;
let db;

async function connectToDB() {
  // If we haven't created a client yet, do so now
  if (!client) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
  }
  
  // Connect the client to the server (only if not already connected)
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    console.log("Connected to MongoDB!");
    
    // Optionally 'ping' if you want to confirm
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    // Choose or create a database name (e.g. 'myDatabase')
    db = client.db('myDatabase');
  }

  return db; 
}

// If you want a helper to retrieve the DB instance after connecting
function getDB() {
  if (!db) throw new Error("DB not connected yet. Call connectToDB() first.");
  return db;
}

module.exports = { connectToDB, getDB };