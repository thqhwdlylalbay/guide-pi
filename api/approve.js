// كود الموافقة على المعاملة المربوط بالمشروع الجديد
export default async function handler(req, res) {
    const { paymentId } = req.query;
    
    // سحب المفتاح السري من الإعدادات اللي عملناها في Vercel
    const API_KEY = process.env.PI_API_KEY; 

    // التأكد من وجود كود العملية
    if (!paymentId) {
        return res.status(400).json({ message: "Missing paymentId" });
    }

    try {
        // الاتصال بخوادم Pi لإرسال الموافقة (Approve)
        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (response.ok) {
            res.status(200).json({ message: "تمت الموافقة من السيرفر بنجاح!", details: data });
        } else {
            res.status(400).json({ message: "فشلت الموافقة من طرف Pi", error: data });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
            }
