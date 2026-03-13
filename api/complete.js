const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { paymentId, txid } = req.body;
    const apiKey = process.env.PI_API_KEY;

    try {
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            txid: txid
        }, {
            headers: { 'Authorization': `Key ${apiKey}` }
        });
        res.status(200).json({ message: "Completed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Completion failed" });
    }
};
