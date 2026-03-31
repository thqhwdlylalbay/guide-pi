// المسار: functions/complete.js
export async function onRequestPost(context) {
  try {
    const { paymentId, txid, endpoint } = await context.request.json();
    const apiKey = context.env.PI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API Key missing" }), { status: 500 });
    }

    // تحديد المسار الصحيح (إما approve أو complete) بناءً على ما يطلبه الكود الأمامي
    const targetUrl = `https://api.minepi.com/v2/payments/${paymentId}/${endpoint}`;

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      // في حالة الـ complete نرسل الـ txid، في حالة الـ approve لا نحتاجه
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
