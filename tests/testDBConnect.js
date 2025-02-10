const { MongoClient, ServerApiVersion } = require('mongodb');
const { username, password } = require('../api.json');

const uri = `mongodb+srv://${username}:${password}@expensemanager1.3yfoo.mongodb.net/?retryWrites=true&w=majority&appName=ExpenseManager1`;

  async function testConnection() {
    let client;

    try {
      client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true
        }
      });

      await client.connect();
      console.log('Successfully connected to MongoDB');

      // Verify the connection by pinging the database
      await client.db('admin').command({ ping: 1 });
      console.log('Pinged the deployment. Connection is successful!');

      // Close connection after testing
      await client.close();
      console.log('Connection closed');
    } catch (error) {
      console.error('MongoDB Connection Failed:', error);
    }
  }

testConnection();