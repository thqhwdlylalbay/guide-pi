export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const paymentId = url.searchParams.get('paymentId');
    const API_KEY = env.PI_API_KEY; 

    if (!paymentId) return new Response("Missing paymentId", { status: 400 });

    try {
        // خطوة الموافقة (Approve)
        await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
            method: 'POST',
            headers: { 
                'Authorization': `Key ${API_KEY}`,
                'Content-Type': 'application/json' 
            }
        });

        // خطوة الإكمال (Complete)
        await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
            method: 'POST',
            headers: { 
                'Authorization': `Key ${API_KEY}`,
                'Content-Type': 'application/json' 
            }
        });

        return new Response(JSON.stringify({ status: "completed" }), {
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
          }
