export async function onRequestPost(context) {
    const { paymentId, txid, pi_uid } = await context.request.json();
    const db = context.env.DB;

    // تسجيل العملية في جدول المدفوعات
    await db.prepare(
        "INSERT INTO payments (paymentId, txid, pi_uid) VALUES (?, ?, ?)"
    ).bind(paymentId, txid, pi_uid).run();

    // إرسال إشارة الإكمال لـ Pi Network
    await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${context.env.PI_API_KEY}`
        }
    });

    return new Response(JSON.stringify({ status: "Payment Completed & Saved" }));
}
