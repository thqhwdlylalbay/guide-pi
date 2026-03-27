// functions/complete.js
export async function onRequestPost(context) {
  try {
    const { paymentId, txid } = await context.request.json();
    const apiKey = context.env.PI_API_KEY;

    if (!apiKey) return new Response("Missing API Key", { status: 500 });

    // الخطوة 1: الموافقة (Approve) - دي اللي الكورتيم بيطلبها الأول
    await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { "Authorization": `Key ${apiKey}` }
    });

    // الخطوة 2: الإتمام (Complete) - نبعت الـ txid رسمياً
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid: txid }),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), { 
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
