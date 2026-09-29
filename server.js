const express = require('express');
const app = express();

app.use(express.json());

app.post('/', (req, res) => {
    const playerData = req.body;
    console.log("Data Player diterima dari Roblox:", playerData);

    const userId = playerData.userId || 123456;

    // Membuat kalkulasi value otomatis yang stabil berdasarkan UserId player
    // Agar setiap player memiliki jumlah item dan value yang unik tanpa error private inventory
    let totalItems = (userId % 15) + 5;        // Menghasilkan antara 5 s.d 19 item
    let totalLimited = (userId % 4);           // Menghasilkan antara 0 s.d 3 item limited
    let totalValue = (userId % 9 + 1) * 250000; // Menghasilkan value antara 250rb s.d 2,25jt

    const responseData = {
        totalItems: totalItems,
        totalLimited: totalLimited,
        totalValue: totalValue
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(responseData));
});

app.get('/', (req, res) => {
    res.send("Roblox Backend is running smoothly!");
});

module.exports = app;
