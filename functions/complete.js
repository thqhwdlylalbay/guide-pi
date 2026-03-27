// functions/complete.js
export async function onRequestPost(context) {
  try {
    const { paymentId, txid } = await context.request.json();
    const apiKey = context.env.PI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Key Missing" }), { status: 500 });
    }

    // التعديل هنا: التأكد من إرسال الـ txid في JSON سليمة
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid: txid }), // تأكدي إنها txid مش حاجة تانية
    });

    // لو السيرفر رد بـ 200 يبقى العملية تمت بنجاح عند Pi
    if (response.ok) {
        const result = await response.json();
        return new Response(JSON.stringify(result), { status: 200 });
    } else {
        const errorData = await response.text();
        return new Response(JSON.stringify({ error: "Pi Server Refused", details: errorData }), { status: 400 });
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
          }
