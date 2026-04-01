export async function onRequestPost(context) {
    const { request, env } = context;
    try {
        const { paymentId, txid } = await request.json();
        
        const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: "POST",
            headers: {
                "Authorization": `Key ${env.PI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ txid: txid })
        });
        
        const data = await res.json();
        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
