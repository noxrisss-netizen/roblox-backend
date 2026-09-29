const express = require('express');
const app = express();

app.use(express.json());

app.post('/', async (req, res) => {
    const playerData = req.body;
    console.log("Mengecek inventory web untuk UserID:", playerData.userId);

    const userId = playerData.userId;
    let totalItems = 0;
    let totalLimited = 0;
    let totalValue = 0;

    if (userId) {
        try {
            // Mengambil data asset publik dari inventory Roblox via RoProxy (Kategori Hats / Aksesoris)
            const url = `https://inventory.roproxy.com/v2/users/${userId}/inventory/8?limit=100`;
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.data) {
                const items = data.data;
                totalItems = items.length;

                // Hitung otomatis berdasarkan item publik yang ditemukan
                items.forEach(item => {
                    const isLimited = item.isLimited || item.isLimitedUnique || false;
                    if (isLimited) {
                        totalLimited += 1;
                        totalValue += 1000000; // Estimasi value item limited
                    } else {
                        totalValue += 25000;  // Estimasi item biasa
                    }
                });
            }
        } catch (error) {
            console.log("Inventory private atau gagal diakses:", error.message);
            totalItems = 0;
            totalLimited = 0;
            totalValue = 0;
        }
    }

    const responseData = {
        totalItems: totalItems,
        totalLimited: totalLimited,
        totalValue: totalValue
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(responseData));
});

app.get('/', (req, res) => {
    res.send("Flexing Inventory Backend is running!");
});

module.exports = app;
