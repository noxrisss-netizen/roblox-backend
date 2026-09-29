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
                                // 1. Semua item pasti masuk ke Total Item
                                totalItems += 1;

                                const isLimited = item.isLimited || item.isLimitedUnique || false;
                                
                                if (isLimited) {
                                    // Cek status off-sale atau ketersediaan harga pasaran
                                    // Jika item limited berstatus off-sale (tidak dijual/tidak ada harga), value-nya 0.
                                    const isOffSale = item.isOffSale || false;
                                    const itemPrice = item.price || 0;

                                    if (!isOffSale && itemPrice > 0) {
                                        totalLimited += 1;
                                        totalRobuxSpent += itemPrice;
                                        totalValue += itemPrice * 100; // Valuasi untuk limited aktif
                                    } else {
                                        // Jika limited berstatus Off-Sale atau tidak ada harganya, tetap terhitung item limited di inventory, 
                                        // tapi Value dan Robux-nya 0 sesuai aturan kamu!
                                        totalLimited += 1; 
                                    }
                                } else {
                                    // 2. Item Non-Limited (Berbayar vs Gratis)
                                    const itemPrice = item.price || 0;
                                    
                                    if (itemPrice > 0) {
                                        totalRobuxSpent += itemPrice;
                                        totalValue += itemPrice * 10;
                                    }
                                    // Jika itemPrice == 0 (gratis/bawaan), tidak menambah robux & value sama sekali
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
