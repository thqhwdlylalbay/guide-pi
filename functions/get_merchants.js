export async function onRequest(context) {
  const { env } = context;
  try {
    // هنا بنكلم قاعدة البيانات اللي أنتي ربطتيها باسم DB
    const { results } = await env.DB.prepare("SELECT * FROM merchants").all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
