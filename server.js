const express = require('express');
const app = express();

app.use(express.json());

// Menangani request POST dari game Roblox
app.post('/', (req, res) => {
    const playerData = req.body;
    console.log("Data Player diterima dari Roblox:", playerData);
    
    // Set header eksplisit agar Roblox tidak bingung (ServerProtocolError)
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({ status: "success", message: "Data diterima!" }));
});

// Menangani test GET biasa
app.get('/', (req, res) => {
    res.send("Roblox Backend is running!");
});

module.exports = app;
