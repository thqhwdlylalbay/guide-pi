export default {
  async fetch(request, env) {
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
    const { paymentId } = await request.json();
    const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { "Authorization": `Key ${env.PI_API_KEY}`, "Content-Type": "application/json" }
    });
    return new Response(JSON.stringify(await res.json()), { headers: { "Content-Type": "application/json" } });
  }
}
