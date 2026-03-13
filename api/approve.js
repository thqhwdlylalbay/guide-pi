const axios = require('axios');

module.exports = async (req, res) => {
    // تفعيل الـ CORS عشان الموقع يقدر يكلم السيرفر
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { paymentId } = req.body;
    // المفتاح اللي إنتي حطيتيه في Netlify هو اللي هيشغل السطر ده
    const apiKey = process.env.PI_API_KEY; 

    try {
        await axios.post(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {}, {
            headers: { 'Authorization': `Key ${apiKey}` }
        });
        res.status(200).json({ message: "Approved" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Approval failed" });
    }
};
