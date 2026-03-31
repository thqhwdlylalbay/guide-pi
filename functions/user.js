
export async function onRequestPost(context) {
    const { pi_uid } = await context.request.json();
    const db = context.env.DB;

    // محاولة إضافة مستخدم جديد، وإذا كان موجوداً سيتجاهل الأمر بسبب (UNIQUE)
    await db.prepare(
        "INSERT OR IGNORE INTO users (pi_uid) VALUES (?)"
    ).bind(pi_uid).run();

    return new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" }
    });
}
