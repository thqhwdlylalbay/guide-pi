export async function onRequestPost(context) {
  try {
    const { paymentId, txid, endpoint } = await context.request.json();
    const apiKey = context.env.PI_API_KEY;

    // تحديد المسار (موافقة أم إتمام)
    const url = `https://api.minepi.com/v2/payments/${paymentId}/${endpoint || 'complete'}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(txid ? { txid } : {}),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
