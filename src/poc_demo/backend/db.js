// Importing the Mongoose library for MongoDB interaction
const mongoose = require('mongoose');

const Group = require('./group'); // Import the Group model
const User = require('./user'); // Import the User model

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
db.once('open', async () => {
  console.log('Connected to MongoDB');

  // Check if initial data exists in the "Group" collection
  const existingGroups = await Group.find();

  if (existingGroups.length === 0) {
    // Initial data doesn't exist; insert it

    const initialGroups = [
      { name: 'Emerson Group' },
      { name: 'Westdale Group' },
      { name: 'Norfolk Group' },
    ];

    try {
      await Group.create(initialGroups);
      console.log('Initial groups inserted successfully.');
    } catch (error) {
      console.error('Error inserting initial groups:', error);
    }
  }

  // Reset User Amounts to 0
  const RESET_AMOUNTS = 0;
  if (RESET_AMOUNTS){
    try {
      await User.updateMany({},{amount: 0});
      console.log("Reset User Amounts to 0.")
    } catch (error){
      console.error('Error resetting amounts:', error);
    }
  } 
});

// Export the database connection object for use in other parts of the application
module.exports = db;
