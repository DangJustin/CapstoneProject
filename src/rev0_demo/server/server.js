const express = require('express')
const app = express()

// Example of api request and response. TODO: Delete later
app.get("/api", (req, res) => {
    res.json({ "users": ["userOne"]})
})

app.listen(5000, () => {console.log("Server started on port 5000")})