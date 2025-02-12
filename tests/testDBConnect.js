const mongoose = require('mongoose');
const { username, password } = require('../api.json');

// const uri = `mongodb+srv://${username}:${password}@expensemanager1.3yfoo.mongodb.net/?retryWrites=true&w=majority&appName=ExpenseManager1`;

// backup database connection string

async function connectToDB() {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB via mongoose!');
    } catch (err) {
        console.error('Failed to connect to MongoDB via mongoose:', err);
        throw err;
    }
}


connectToDB();