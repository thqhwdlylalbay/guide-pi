export async function onRequestPost(context) {
  const { request, env } = context;
  const { paymentId } = await request.json();
  
  const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
    method: "POST",
    headers: {
      "Authorization": `Key ${env.PI_API_KEY}`,
      "Content-Type": "application/json"
    }
  });
  
  return new Response(JSON.stringify(await response.json()), {
    headers: { "Content-Type": "application/json" }
  });
}
