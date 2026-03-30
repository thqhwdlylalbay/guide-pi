export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();
    const { paymentId, txid, action } = body;
    
    const apiKey = env.PI_API_KEY; // المفتاح الذي أضفتيه في Cloudflare
    const baseUrl = "https://api.minepi.com/v2/payments/";

    try {
        if (action === 'approve') {
            // إرسال الموافقة للسيرفر
            await fetch(`${baseUrl}${paymentId}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Key ${apiKey}` }
            });
        } else if (action === 'complete') {
            // إرسال إشارة الإكمال بعد توفر الـ txid
            await fetch(`${baseUrl}${paymentId}/complete`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ txid: txid })
            });
        }
        
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
