// المسار: functions/complete.js
export async function onRequestPost(context) {
  try {
    const { paymentId, txid, endpoint } = await context.request.json();
    const apiKey = context.env.PI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });
    }

    // endpoint سيكون إما 'approve' أو 'complete'
    const targetUrl = `https://api.minepi.com/v2/payments/${paymentId}/${endpoint}`;

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: endpoint === 'complete' ? JSON.stringify({ txid }) : null,
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
