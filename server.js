const express = require('express');
const app = express();

app.use(express.json());

// Menangani request POST dari game Roblox
app.post('/', (req, res) => {
    const playerData = req.body;
    console.log("Data Player diterima dari Roblox:", playerData);
    
    // Kirim respon sukses kembali ke Roblox
    res.status(200).json({ status: "success", message: "Data diterima!" });
});

// Menangani test GET biasa agar tidak error "Cannot GET /"
app.get('/', (req, res) => {
    res.send("Roblox Backend is running!");
});

module.exports = app;
