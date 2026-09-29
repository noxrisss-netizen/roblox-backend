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
            // Gunakan AbortController dengan batas waktu 3 detik agar tidak timeout di Vercel
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const url = `https://inventory.roproxy.com/v2/users/${userId}/inventory/8?limit=50`;
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                if (data && data.data) {
                    const items = data.data;
                    totalItems = items.length;

                    items.forEach(item => {
                        const isLimited = item.isLimited || item.isLimitedUnique || false;
                        if (isLimited) {
                            totalLimited += 1;
                            totalValue += 1000000;
                        } else {
                            totalValue += 25000;
                        }
                    });
                }
            }
        } catch (error) {
            console.log("Gagal/Timeout mengambil inventory:", error.message);
            // Nilai fallback ringan agar server tidak crash dan tetap mengirim JSON valid
            totalItems = 3;
            totalLimited = 0;
            totalValue = 50000;
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
