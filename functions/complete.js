// هذا الكود سيعمل على سيرفرات Cloudflare Pages أوتوماتيكياً
export async function onRequestPost(context) {
  try {
    const { paymentId, txid } = await context.request.json();
    const apiKey = "YOUR_API_KEY_HERE"; // سنضع هنا مفتاحك من لوحة Pi لاحقاً

    // إرسال إشارة الإتمام لسيرفرات Pi الرسمية
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), { status: response.status });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
