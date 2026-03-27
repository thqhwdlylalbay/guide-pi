export async function onRequestPost(context) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const data = await context.request.json();
    const paymentId = data.paymentId;
    const txid = data.txid;
    const apiKey = context.env.PI_API_KEY;

    if (!paymentId || !txid || !apiKey) {
      return new Response(JSON.stringify({ error: "بيانات ناقصة أو مفتاح API مفقود" }), { status: 400, headers: corsHeaders });
    }

    // المرحلة 2: الموافقة (Approve)
    await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { "Authorization": `Key ${apiKey}` }
    });

    // المرحلة 3: الإتمام (Complete)
    const piResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid: txid }),
    });

    const result = await piResponse.json();
    return new Response(JSON.stringify(result), { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
                                       }
