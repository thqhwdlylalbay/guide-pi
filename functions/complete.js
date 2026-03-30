export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { paymentId, txid, action } = body;

    const PI_API_KEY = env.PI_API_KEY; // تأكدي من إضافة المفتاح في Settings -> Variables في Cloudflare
    const baseUrl = "https://api.minepi.com/v2/payments/";

    try {
        let endpoint = "";
        let requestBody = {};

        if (action === 'approve') {
            endpoint = `${paymentId}/approve`;
        } else if (action === 'complete') {
            endpoint = `${paymentId}/complete`;
            requestBody = { txid: txid };
        } else {
            return new Response("Invalid Action", { status: 400 });
        }

        const response = await fetch(baseUrl + endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${PI_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: action === 'complete' ? JSON.stringify(requestBody) : null
        });

        const result = await response.json();

        return new Response(JSON.stringify(result), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
            }
