export async function onRequestPost(context) {
    const { env, request } = context;
    const data = await request.json();
    
    // أمر الإدخال في قاعدة البيانات أوتوماتيكياً
    await env.DB.prepare(
        "INSERT INTO merchants (name, category, price_pi) VALUES (?, ?, ?)"
    ).bind(data.name, data.category, data.price).run();

    return new Response("Success", { status: 200 });
}
