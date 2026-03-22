export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ده السطر اللي بيخلي المفتاح متاح للاستخدام لو احتجناه
    const mySecret = env.PI_API_KEY;

    // السطر ده هو "المنقذ" اللي بيخلي كلوود فلير يفتح ملف index.html وباقي الصور والمفات
    return env.ASSETS.fetch(request);
  },
};
