const express = require('express');
const app = express();

app.use(express.json());

app.post('/', async (req, res) => {
    const playerData = req.body;
    console.log("Mengecek inventory akurat untuk UserID:", playerData.userId);

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
                                    const isOffSale = item.isOffSale || false;
                                    if (!isOffSale) {
                                        totalLimited += 1;
                                        totalRobuxSpent += 1000;
                                        totalValue += 1000000;
                                    } else {
                                        totalLimited += 1; // Off-sale value 0
                                    }
                                } else {
                                    // Pengecekan ketat: Item gratis/bawaan dari Roblox biasanya memiliki ID asset tertentu 
                                    // atau creator official Roblox. Kita filter agar item gratis tidak menambah Robux.
                                    const creatorId = item.creator && item.creator.id ? item.creator.id : null;
                                    
                                    // Jika item dibuat oleh Roblox official (biasanya item event/bawaan gratis), harganya 0.
                                    // Jika dibuat oleh user/group lain, baru dihitung sebagai item berbayar/beli.
                                    if (creatorId && creatorId !== 1) { 
                                        let estimatedPrice = 50; // Rata-rata harga wajar pakaian user
                                        totalRobuxSpent += estimatedPrice;
                                        totalValue += estimatedPrice * 50;
                                    }
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
    res.send("Accurate Inventory Backend is running!");
});

module.exports = app;
