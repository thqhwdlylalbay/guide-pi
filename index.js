// 1. انسخي الكود (Validation Key) اللي ظاهر عندك في صفحة المطورين مكان النقط
const validationKey = "13074bc87cb82050e631cac2243884873eabd53e19a9acfd751457bb5c50b97d68f42c55f941a83aca4597888de22b4ee4e0334282f18dba6381d8beac452758";

const htmlPage = `... كود الصفحة اللي بعتهولك قبل كدة ...`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // الخطوة اللي هتحل مشكلة الصورة 1000096527.jpg
    // لما باي تدخل تدور على ملف التأكيد، الكود ده هيرد عليها فوراً
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, {
        headers: { "Content-Type": "text/plain" }
      });
    }

    // كود الموافقة على الدفع (Approve)
    if (url.pathname === "/approve" && request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      const res = await fetch("https://api.minepi.com/v2/payments/" + paymentId + "/approve", {
        method: "POST",
        headers: {
          "Authorization": "Key " + env.PI_API_KEY,
          "Content-Type": "application/json"
        }
      });
      return new Response(await res.text());
    }

    return new Response(htmlPage, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
