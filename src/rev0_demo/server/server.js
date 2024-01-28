const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRoutes = require('./routes/indexRoutes');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://housemates783:Capstone100@housematesapp.jecbapz.mongodb.net/?retryWrites=true&w=majority';

app.use(express.json());
app.use('/api', userRoutes);

// Connect to DB
mongoose.connect(MONGO_URI)
    .then(() => {
        // Listen for requests
        app.listen(PORT, () => {
            console.log("Server started on port", PORT)
        })
    })
    .catch((err) => {
        console.log(err)
    })

