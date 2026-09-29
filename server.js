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
            // Daftar Kategori Asset Roblox yang ingin dicek sekaligus:
            // 8 = Hats, 41 = Hair, 18 = Face, 19 = Neck, 42 = Shoulders, 43 = Front, 44 = Back, 45 = Waist
            const assetTypes = [8, 41, 18, 19, 42, 43, 44, 45];
            
            for (const assetTypeId of assetTypes) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2000);

                    const url = `https://inventory.roproxy.com/v2/users/${userId}/inventory/${assetTypeId}?limit=50`;
                    const response = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.data) {
                            const items = data.data;
                            totalItems += items.length; // Menambahkan jumlah item dari setiap kategori

                            items.forEach(item => {
                                const isLimited = item.isLimited || item.isLimitedUnique || false;
                                if (isLimited) {
                                    totalLimited += 1;
                                    totalValue += 1000000;
                                } else {
                                    totalValue += 10000; // Harga estimasi item biasa/gratisan
                                }
                            });
                        }
                    }
                } catch (err) {
                    // Abaikan jika salah satu kategori gagal/timeout, lanjut ke kategori berikutnya
                }
            }
        } catch (error) {
            console.log("Gagal total mengambil inventory:", error.message);
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
