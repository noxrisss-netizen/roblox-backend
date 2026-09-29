const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use(express.json());

app.post('/get-account-value', async (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        return res.status(400).json({ error: "UserId is required" });
    }

    try {
        const response = await fetch(`https://inventory.roblox.com/v2/users/${userId}/inventory/8?limit=100`);
        
        if (!response.ok) {
            return res.json({ totalItems: 0, totalValue: 0, status: "Private or Error" });
        }

        const data = await response.json();
        const items = data.data || [];

        let totalItems = items.length;
        let totalValue = totalItems * 1000;

        res.json({
            totalItems: totalItems,
            totalValue: totalValue,
            status: "Success"
        });

    } catch (error) {
        console.error("Error fetching inventory:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});