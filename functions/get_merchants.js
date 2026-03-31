export async function onRequest(context) {
  const { env } = context;

  // فحص هل قاعدة البيانات مربوطة بالاسم الصحيح DB؟
  if (!env.DB) {
    return new Response(JSON.stringify({ error: "لم يتم العثور على ربط قاعدة البيانات (DB Binding)" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // جلب البيانات من جدول merchants
    const { results } = await env.DB.prepare("SELECT * FROM merchants").all();
    
    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "خطأ في الاستعلام: " + err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
