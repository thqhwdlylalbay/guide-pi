export async function onRequestPost(context) {
  // 1. تعريف تصاريح العبور (جواز السفر)
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const { paymentId, txid } = await context.request.json();
    const apiKey = context.env.PI_API_KEY;

    // 2. خطوة الـ Approve
    await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { "Authorization": `Key ${apiKey}` }
    });

    // 3. خطوة الـ Complete
    const piResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });

    const result = await piResponse.json();

    // 4. الرد مع تصاريح العبور (CORS)
    return new Response(JSON.stringify(result), { 
      status: 200, 
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      } 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: corsHeaders
    });
  }
}

// إضافة التعامل مع طلبات Preflight (مهم جداً لـ Cloudflare)
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
    }
