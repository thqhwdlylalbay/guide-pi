export async function onRequest(context) {
  const { env } = context;
  
  // فحص هل الربط موجود أصلاً؟
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Binding DB not found" }), { status: 500 });
  }

  try {
    // محاولة جلب البيانات
    const data = await env.DB.prepare("SELECT * FROM merchants").all();
    
    return new Response(JSON.stringify(data.results), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
