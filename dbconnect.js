
import { MongoClient, ServerApiVersion } from 'mongodb';
import { username, password } from './api.json';
const uri = `mongodb+srv://${username}:${password}@expensemanager1.3yfoo.mongodb.net/?retryWrites=true&w=majority&appName=ExpenseManager1`;
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
    
    db = client.db('Accounts');
  }
  return db; 
}

function getDB() {
  if (!db) throw new Error("DB not connected yet. Call connectToDB() first.");
  return db;
}

export default { connectToDB, getDB };
