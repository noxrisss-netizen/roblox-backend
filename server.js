const express = require('express');
const axios = require('axios'); // Pastikan package axios terinstal di project Vercel kamu (atau bisa pakai fetch bawaan Node.js)
const app = express();

app.use(express.json());

app.post('/', async (req, res) => {
    const playerData = req.body;
    console.log("Data Player diterima dari Roblox:", playerData);

    const userId = playerData.userId;
    let totalItems = 0;
    let totalLimited = 0;
    let totalValue = 0;

    if (userId) {
        try {
            // Mengambil data inventaris publik player via RoProxy (Contoh: Asset type 8 / Hats atau Aksesoris)
            const response = await axios.get(`https://inventory.roproxy.com/v2/users/${userId}/inventory/8?limit=50`);
            
            if (response.data && response.data.data) {
                const items = response.data.data;
                totalItems = items.length;

                // Hitung otomatis berdasarkan item yang didapat dari API
                items.forEach(item => {
                    // Cek apakah item memiliki indikasi limited atau harga tertentu
                    // (Logika ini bisa disesuaikan dengan kebutuhan harga/value item)
                    const isLimited = item.isLimited || item.isLimitedUnique || false;
                    
                    if (isLimited) {
                        totalLimited += 1;
                        // Berikan perkiraan value otomatis untuk item limited (misal: ambil dari asset info atau set default)
                        totalValue += 500000; 
                    } else {
                        // Item biasa/bukan limited
                        totalValue += 10000;
                    }
                });
            }
        } catch (error) {
            console.log("Gagal mengambil inventory via RoProxy (Kemungkinan Private):", error.message);
            // Fallback otomatis jika inventaris private atau gagal ditarik
            totalItems = 3;
            totalLimited = 0;
            totalValue = 150000;
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
    res.send("Roblox Dynamic Backend is running!");
});

module.exports = app;
