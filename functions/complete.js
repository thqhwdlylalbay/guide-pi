export async function onRequest(context) {
    const { request, env } = context;
    
    // تأكد أن الطلب POST
    if (request.method !== "POST") return new Response("Forbidden", { status: 403 });

    try {
        const { paymentId, txid } = await request.json();
        const API_KEY = env.PI_API_KEY; // المفتاح مخفي في إعدادات Cloudflare

        // إرسال التأكيد النهائي لشركة باي
        const piResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ txid })
        });

        if (piResponse.ok) {
            return new Response(JSON.stringify({ status: "success" }), { status: 200 });
        } else {
            return new Response("Pi API Error", { status: 400 });
        }
    } catch (err) {
        return new Response(err.message, { status: 500 });
    }
}
