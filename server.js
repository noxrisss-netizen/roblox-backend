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
                                        totalLimited += 1;
                                    }
                                } else {
                                    // Deteksi item: item bawaan/gratis standar biasanya memiliki ID asset di bawah angka tertentu 
                                    // atau kita filter berdasarkan nama/aset dasar. 
                                    // Untuk item berbayar player, kita berikan estimasi harga wajar per item baju/aksesori (misal 15-25 Robux) 
                                    // agar akumulasinya pas dengan total pengeluaran top-up, bukan ribuan.
                                    
                                    const assetId = item.assetId || item.id || 0;
                                    
                                    // Contoh filter: Asumsikan item dengan ID sangat kecil adalah item klasik gratis/bawaan
                                    if (assetId > 10000000) { 
                                        let estimatedPrice = 20; // Rata-rata harga per item baju/celana user
                                        totalRobuxSpent += estimatedPrice;
                                        totalValue += estimatedPrice * 100;
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
