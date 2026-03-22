export default {
  async fetch(request, env) {
    // قراءة المفتاح السري اللي ضفته في إعدادات Cloudflare
    const mySecretKey = env.PI_API_KEY;

    // هنا الكود بيمرر الطلب للموقع عادي مع الحفاظ على سرية المفتاح في الخلفية
    return await fetch(request);
  },
};
