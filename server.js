const express = require('express');
const axios = require('axios');
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
            // Mengambil data asset publik dari inventory Roblox via RoProxy
            // Menggunakan asset type 8 (Hats/Aksesoris kepala yang sering dipakai flexing)
            const url = `https://inventory.roproxy.com/v2/users/${userId}/inventory/8?limit=100`;
            const response = await axios.get(url);

            if (response.data && response.data.data) {
                const items = response.data.data;
                totalItems = items.length;

                // Hitung item limited atau estimasi berdasarkan jumlah item unik mereka
                items.forEach(item => {
                    if (item.isLimited || item.isLimitedUnique) {
                        totalLimited += 1;
                        totalValue += 1000000; // Estimasi value untuk item limited
                    } else {
                        totalValue += 25000;  // Estimasi item biasa
                    }
                });
            }
        } catch (error) {
            console.log("Inventory diset Private atau gagal diakses:", error.message);
            // Fallback jika inventory player di-private di web profil mereka
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
