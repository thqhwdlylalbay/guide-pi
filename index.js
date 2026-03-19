// 1. افتحي صفحة المطورين، وانقلي الكود اللي تحت كلمة "How to verify" بدقة
const validationKey = "13074bc87cb82050e631cac2243884873eabd53e19a9acfd751457bb5c50b97d68f42c55f941a83aca4597888de22b4ee4e0334282f18dba6381d8beac452758"; 

const htmlPage = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><script src="https://sdk.minepi.com/pi-sdk.js"></script></head><body><h2>ثقة ودليل الباي</h2></body></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // دي الخطوة اللي باي بتدور عليها
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, {
        headers: { 
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }

    // كود الموافقة
    if (url.pathname === "/approve") {
      const paymentId = url.searchParams.get("id");
      const res = await fetch("https://api.minepi.com/v2/payments/" + paymentId + "/approve", {
        method: "POST",
        headers: { "Authorization": "Key " + env.PI_API_KEY, "Content-Type": "application/json" }
      });
      return new Response(await res.text());
    }

    return new Response(htmlPage, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
