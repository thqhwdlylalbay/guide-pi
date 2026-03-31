export async function onRequest(context) {
  const { env } = context;
  
  try {
    // محاولة جلب البيانات من جدول merchants
    const data = await env.DB.prepare("SELECT * FROM merchants").all();
    
    return new Response(JSON.stringify(data.results), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    });
  } catch (e) {
    // لو فيه مشكلة، الكود ده هيقولنا إيه هي بالظبط
    return new Response(JSON.stringify({ error: "Database Error: " + e.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
