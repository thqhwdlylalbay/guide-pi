// functions/complete.js

export async function onRequestPost(context) {
    try {
        const { paymentId, txid, action } = await context.request.json();
        
        // جلب المفتاح السري من Environment Variables في Cloudflare
        const apiKey = context.env.PI_API_KEY; 

        if (!apiKey) {
            return new Response("API Key missing in environment", { status: 500 });
        }

        // 1. مرحلة الموافقة (Approve)
        if (action === 'approve') {
            const approveRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Key ${apiKey}` }
            });
            return new Response(JSON.stringify({ success: approveRes.ok }), { status: 200 });
        }

        // 2. مرحلة الإكمال (Complete)
        if (action === 'complete') {
            const completeRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ txid })
            });
            return new Response(JSON.stringify({ success: completeRes.ok }), { status: 200 });
        }

        return new Response("Invalid Action", { status: 400 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
