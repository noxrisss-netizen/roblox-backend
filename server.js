const express = require('express');
const app = express();

app.use(express.json());

app.post('/', async (req, res) => {
    const playerData = req.body;
    console.log("Mengecek real inventory web untuk UserID:", playerData.userId);

    const userId = playerData.userId;
    let totalItems = 0;
    let totalLimited = 0;
    let totalRobuxSpent = 0;
    let totalValue = 0;

    if (userId) {
        try {
            const assetTypes = [8, 41, 11, 12]; // Hats, Hair, Shirt, Pants
            
            for (const assetTypeId of assetTypes) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 3000);

                    const url = `https://inventory.roproxy.com/v2/users/${userId}/inventory/${assetTypeId}?limit=100`;
                    const response = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.data) {
                            const items = data.data;
                            
                            for (const item of items) {
                                totalItems += 1;

                                const isLimited = item.isLimited || item.isLimitedUnique || false;
                                
                                if (isLimited) {
                                    totalLimited += 1;
                                    const isOffSale = item.isOffSale || false;
                                    if (!isOffSale) {
                                        totalRobuxSpent += 1000;
                                        totalValue += 1000000;
                                    }
                                } else {
                                    // Karena API inventory publik Roblox tidak memberikan info harga beli secara langsung,
                                    // kita berikan estimasi rata-rata harga pakaian/aksesori berbayar (misal: 75 Robux per item)
                                    // kecuali untuk item yang terdeteksi pasti gratis/bawaan akun baru.
                                    
                                    // Kita asumsikan item yang masuk inventaris web selain item default bernilai robux:
                                    let estimatedPrice = 75; // Rata-rata harga baju/aksesori di katalog
                                    
                                    totalRobuxSpent += estimatedPrice;
                                    totalValue += estimatedPrice * 100; // Kalkulasi value akun
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.log(`Gagal ambil kategori ${assetTypeId}:`, err.message);
                }
            }
        } catch (error) {
            console.log("Gagal total mengambil inventory:", error.message);
        }
    }

    const responseData = {
        totalItems: totalItems,
        totalLimited: totalLimited,
        totalRobux: totalRobuxSpent,
        totalValue: totalValue
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(responseData));
});

app.get('/', (req, res) => {
    res.send("Real Inventory Backend is running!");
});

module.exports = app;
