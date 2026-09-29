const express = require('express');
const app = express();

app.use(express.json());

app.post('/', async (req, res) => {
    const playerData = req.body;
    console.log("Mengecek inventory web untuk UserID:", playerData.userId);

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
                    const timeoutId = setTimeout(() => controller.abort(), 2000);

                    const url = `https://inventory.roproxy.com/v2/users/${userId}/inventory/${assetTypeId}?limit=100`;
                    const response = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeoutId);

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.data) {
                            const items = data.data;
                            totalItems += items.length;

                            items.forEach(item => {
                                const isLimited = item.isLimited || item.isLimitedUnique || false;
                                
                                if (isLimited) {
                                    totalLimited += 1;
                                    totalValue += 1000000; // Harga item limited
                                    totalRobuxSpent += 5000; 
                                } else {
                                    // Cek apakah item memiliki harga Robux / dibeli (biasanya item gratis harganya 0 atau tidak ada info pembelian)
                                    // Jika item dibeli pakai robux (punya harga > 0 di data web), baru dihitung. 
                                    // Kalau item bawaan/gratis, harganya di-set 0.
                                    const itemPrice = item.price || item.purchasePrice || 0;
                                    
                                    if (itemPrice > 0) {
                                        totalRobuxSpent += itemPrice;
                                        totalValue += itemPrice * 10; // Contoh konversi value dari robux
                                    }
                                    // Jika itemPrice == 0 (item gratisan/bawaan), maka TIDAK MENAMBAH Robux & Value sama sekali!
                                }
                            });
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
    res.send("Flexing Inventory Backend is running!");
});

module.exports = app;
