const db = require('./db');
const userRoutes = require('./userRoutes');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Enable parsing of JSON requests
app.use('/api', userRoutes); // Use the user routes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
