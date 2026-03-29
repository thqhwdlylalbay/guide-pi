// functions/complete.js

export async function onRequestPost(context) {
    try {
        const { paymentId, txid, action } = await context.request.json();
        const apiKey = "اسم_مفتاح_API_الخاص_بك_هنا"; // يوضع هنا API Key من بوابة مطوري Pi

        // إذا كان الطلب للموافقة (Approve)
        if (action === 'approve') {
            await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
                method: 'POST',
                headers: { 'Authorization': `Key ${apiKey}` }
            });
            return new Response(JSON.stringify({ message: "Approved" }), { status: 200 });
        }

        // إذا كان الطلب للإكمال (Complete)
        if (action === 'complete') {
            await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Key ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ txid })
            });
            return new Response(JSON.stringify({ message: "Completed" }), { status: 200 });
        }

        return new Response("Invalid Action", { status: 400 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
