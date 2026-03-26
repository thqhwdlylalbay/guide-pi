// هذا الملف يجب أن يكون في المسار: functions/complete.js
export async function onRequestPost(context) {
  try {
    // 1. استقبال البيانات من صفحة الموقع (الـ Frontend)
    const { paymentId, txid } = await context.request.json();
    
    // 2. سحب المفتاح السري من متغيرات البيئة في Cloudflare
    const apiKey = context.env.PI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API Key is missing in Cloudflare settings" }), { status: 500 });
    }

    // 3. مراسلة سيرفرات Pi لإتمام المعاملة رسمياً
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });

    const result = await response.json();

    // 4. إرسال النتيجة النهائية للمتصفح
    return new Response(JSON.stringify(result), { 
      status: response.status,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
