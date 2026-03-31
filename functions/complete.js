// هذا الملف يجب أن يكون في المسار: functions/complete.js
export async function onRequestPost(context) {
  try {
    const { paymentId, txid } = await context.request.json();
    const apiKey = context.env.PI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "مفتاح الـ API مفقود في إعدادات Cloudflare" }), { status: 500 });
    }

    // 1. خطوة الموافقة (Approve) - إلزامية قبل الإكمال
    const approveRes = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { "Authorization": `Key ${apiKey}` }
    });

    // 2. خطوة الإكمال (Complete)
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
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
