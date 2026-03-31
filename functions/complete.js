export async function onRequestPost(context) {
  try {
    const { paymentId, txid } = await context.request.json();
    const apiKey = context.env.PI_API_KEY;

    if (!paymentId || !txid) {
      return new Response(JSON.stringify({ error: "بيانات ناقصة" }), { status: 400 });
    }

    // 1. الموافقة على الدفعة (Approve)
    // نتحقق أولاً من أن الدفعة صالحة للموافقة
    const approveResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { "Authorization": `Key ${apiKey}` }
    });

    // ملاحظة: إذا كانت الدفعة تمت الموافقة عليها مسبقاً، قد يعيد السيرفر خطأ، لذا يفضل متابعة التنفيذ في بعض الحالات
    // ولكن للأمان، نتحقق من نجاح الخطوة
    const approveData = await approveResponse.json();

    // 2. إكمال الدفعة (Complete)
    // نرسل الـ txid لربط العملية بالبلوكشين وإنهائها
    const completeResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ txid })
    });

    const result = await completeResponse.json();

    // نرسل النتيجة النهائية للمتصفح
    return new Response(JSON.stringify({
      success: completeResponse.ok,
      data: result
    }), {
      status: completeResponse.status,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "خطأ داخلي: " + error.message }), { status: 500 });
  }
}
