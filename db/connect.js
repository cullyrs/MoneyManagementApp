// db/connect.js
const { MongoClient, ServerApiVersion } = require('mongodb');


const uri = "mongodb+srv://cullyrs09:0aUQc3EEjCOLgy4U@cluster0.fao8l.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


let client;
let db;

async function connectToDB() {
  if (!client) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
  }
  
  // Connect the client to the server 
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    console.log("Connected to MongoDB!");
    
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    db = client.db('myDatabase');
  }

  return db; 
}

function getDB() {
  if (!db) throw new Error("DB not connected yet. Call connectToDB() first.");
  return db;
}

module.exports = { connectToDB, getDB };
