// حطي الكود (Validation Key) اللي نسختيه هنا بين علامتين التنصيص
const myKey = "13074bc87cb82050e631cac2243884873eabd53e19a9acfd751457bb5c50b97d68f42c55f941a83aca4597888de22b4ee4e0334282f18dba6381d8beac452758"; 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // دي الحركة اللي هتخلي باي تفتكر إنك رفعتِ الملف
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(myKey, {
        headers: { "Content-Type": "text/plain" }
      });
    }

    // واجهة التطبيق البسيطة للتجربة
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><h2>تم الربط بنجاح!</h2></body></html>`;
    
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
