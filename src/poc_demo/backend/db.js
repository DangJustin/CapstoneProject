// Importing the Mongoose library for MongoDB interaction
const mongoose = require('mongoose');

// Define the URI for connecting to the MongoDB database.
// If the process environment variable MONGODB_URI is set, use it; otherwise, use the provided default URI.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Capstone:RtGwusQvW1dHS8tt@capstone.jy4joer.mongodb.net/?retryWrites=true&w=majority';

// Establish a connection to the MongoDB database using the specified URI and options.
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get the connection object from Mongoose
const db = mongoose.connection;

// Event listener for database connection errors
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

// Event listener for successful database connection
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Export the database connection object for use in other parts of the application
module.exports = db;
