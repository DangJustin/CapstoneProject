const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/indexRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // the port where your React app is hosted
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api', userRoutes);

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://housemates783:Capstone100@housematesapp.jecbapz.mongodb.net/?retryWrites=true&w=majority';


// Start the server only if this file is run directly
if (require.main === module) {
    mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('Server started on port', PORT);
  });
}

module.exports = app; // Export the Express app instance


    

