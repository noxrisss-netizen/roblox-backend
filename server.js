const express = require('express');
const app = express();

app.use(express.json());

app.post('/', async (req, res) => {
    const playerData = req.body;
    console.log("Mengecek inventory web untuk UserID:", playerData.userId);

    const userId = playerData.userId;
    let totalItems = 0;
    let totalLimited = 0;
    let totalRobuxSpent = 0; // Total perkiraan Robux yang dihabiskan untuk beli item
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
                                    totalRobuxSpent += 5000; // Dianggap item limited bernilai Robux tinggi
                                } else {
                                    // Cek apakah ini item berbayar (biasanya punya harga asset, atau kita estimasikan)
                                    // Jika item dibeli pakai Robux (bukan item gratis/0 robux)
                                    // Di sini kita buat aturan: jika asset memiliki indikasi dibeli / bukan item event gratis mutlak:
                                    // Kita asumsikan item non-limited berbayar menyumbang sekitar 50-100 Robux per item.
                                    // Kalau mau murni 0 untuk item gratis total, bisa diatur lewat pengecekan harga aslinya.
                                    
                                    // Contoh estimasi sederhana untuk item yang dibeli pakai robux:
                                    totalRobuxSpent += 75; // Rata-rata harga baju/aksesori robux
                                    totalValue += 15000;
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
        totalRobux: totalRobuxSpent, // Sesuai dengan label "Total Robux" di GUI kamu
        totalValue: totalValue
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify(responseData));
});

app.get('/', (req, res) => {
    res.send("Flexing Inventory Backend is running!");
});

module.exports = app;
