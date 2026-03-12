// هذا هو الكود الذي يوافق على المعاملة برمجياً
export default async function handler(req, res) {
    const { paymentId } = req.query;
const API_KEY = process.env.PI_API_KEY; // مفتاحك

    try {
        // الاتصال بخوادم Pi لإرسال الموافقة (Approve)
        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            res.status(200).json({ message: "تمت الموافقة من السيرفر بنجاح!" });
        } else {
            res.status(400).json({ message: "فشلت الموافقة" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

