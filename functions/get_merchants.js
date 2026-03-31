export async function onRequest(context) {
  const { env } = context;
  // سحب كل التجار من جدول merchants اللي عملناه
  const { results } = await env.DB.prepare("SELECT * FROM merchants").all();
  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" }
  });
}
