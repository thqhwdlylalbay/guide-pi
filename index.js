const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e"; 
const MY_OLD_TXID = "7aadb13583c9982f7650e8619153f87775a80768116fcf2c2f8451ef8dfbcf17";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // التحقق من ملكية الموقع لـ Pi Network
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    // معالجة طلب إكمال المعاملة
    if (request.method === "POST" && url.pathname === "/complete") {
      try {
        const paymentId = url.searchParams.get("id");
        
        // سحب المفتاح من إعدادات Cloudflare (env.PI_API_KEY)
        const API_KEY = env.PI_API_KEY; 

        if (!API_KEY) {
           return new Response(JSON.stringify({ error: "المفتاح غير موجود في إعدادات Cloudflare" }), { status: 500 });
        }

        const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
          method: "POST",
          headers: { 
            "Authorization": `Key ${API_KEY}`, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ txid: MY_OLD_TXID })
        });

        const data = await res.text();
        return new Response(data, { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // واجهة المستخدم (HTML)
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>إصلاح نهائي عبر GitHub</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 20px; background: #fdfdfd; }
        .card { max-width: 420px; margin: auto; background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border: 2px solid #4caf50; }
        .btn { padding: 18px; background: #4caf50; color: white; border: none; border-radius: 12px; width: 100%; cursor: pointer; font-size: 18px; font-weight: bold; }
        #console { margin-top: 20px; padding: 15px; border-radius: 10px; background: #1a1a1a; color: #00ff00; text-align: left; font-family: monospace; font-size: 13px; display: none; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="card">
        <h2 style="color: #2e7d32;">تم التحديث عبر GitHub ✅</h2>
        <p>اضغطي الآن لبدء المحاولة الأخيرة لفك التعليق.</p>
        <button id="btn" class="btn" onclick="start()">تفعيل الربط النهائي</button>
        <div id="console"></div>
    </div>

    <script>
        Pi.init({ version: "2.0", sandbox: false });
        
        async function start() {
            const consoleDiv = document.getElementById('console');
            consoleDiv.style.display = "block";
            consoleDiv.innerHTML = "> فحص حالة الاتصال...\\n";

            try {
                await Pi.authenticate(['payments'], async (payment) => {
                    consoleDiv.innerHTML += "> معاملة معلقة: " + payment.identifier.substring(0,10) + "...\\n";
                    consoleDiv.innerHTML += "> إرسال البيانات للسيرفر...\\n";
                    
                    const response = await fetch('/complete?id=' + payment.identifier, { method: 'POST' });
                    const result = await response.text();
                    
                    consoleDiv.innerHTML += "> الرد النهائي: " + result + "\\n";
                    
                    if(result.includes("success") || result.includes("already")) {
                        alert("ممتاز! تم فك التعليق بنجاح.");
                    }
                });
            } catch (e) {
                consoleDiv.innerHTML += "> ❌ فشل: " + e.message;
            }
        }
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
