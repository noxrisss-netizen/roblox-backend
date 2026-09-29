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
                            totalItems += items.length; // Item gratis tetap bertambah ke total item

                            items.forEach(item => {
                                const isLimited = item.isLimited || item.isLimitedUnique || false;
                                
                                // HANYA ITEM LIMITED YANG MENAMBAH VALUE. Item gratis/biasa value-nya 0.
                                if (isLimited) {
                                    totalLimited += 1;
                                    totalValue += 1000000; // Sesuaikan perkiraan harga item limited
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
        totalValue: totalValue
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(responseData));
});

app.get('/', (req, res) => {
    res.send("Flexing Inventory Backend is running!");
});

module.exports = app;
