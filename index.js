// المفتاح الطويل اللي بعتيه هو كود التحقق من الموقع
const PI_VERIFICATION_CONTENT = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. مسار التحقق من ملكية الموقع (المفتاح الطويل)
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(PI_VERIFICATION_CONTENT, { 
        headers: { "Content-Type": "text/plain; charset=utf-8" } 
      });
    }

    // 2. معالجة طلب إغلاق المعاملة (مفتاح الـ API الأول)
    if (request.method === "POST" && url.pathname === "/complete") {
      try {
        const paymentId = url.searchParams.get("id");
        
        // مفتاح الـ API اللي بيبدأ بـ 3a0o
        const API_KEY = "3a0opkidwbyqjyqkdzs0xljoux0xfqgsizvowwdtmck6bfur8tihttb9jtcf3iwr";

        const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
          method: "POST",
          headers: { 
            "Authorization": `Key ${API_KEY}`, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ txid: "7aadb13583c9982f7650e8619153f87775a80768116fcf2c2f8451ef8dfbcf17" })
        });

        const data = await res.text();
        return new Response(data, { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // 3. واجهة المستخدم HTML
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>إصلاح التحقق والربط</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 20px; background: #f4f4f9; }
        .card { max-width: 400px; margin: auto; padding: 30px; border-radius: 20px; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .btn { padding: 18px; background: #007bff; color: white; border: none; border-radius: 12px; width: 100%; cursor: pointer; font-size: 18px; }
        #log { margin-top: 20px; padding: 10px; background: #222; color: #0f0; text-align: left; font-size: 12px; border-radius: 8px; display: none; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="card">
        <h2 style="color: #007bff;">تحديث كود التحقق ✅</h2>
        <p>تم وضع المفتاح الطويل في ملف التكوين، ومفتاح API في الطلب.</p>
        <button class="btn" onclick="startFix()">إغلاق المعاملة الآن</button>
        <div id="log"></div>
    </div>

    <script>
        Pi.init({ version: "2.0", sandbox: false });
        async function startFix() {
            const log = document.getElementById('log');
            log.style.display = "block";
            log.innerHTML = "> جاري فحص الاتصال بـ Pi...\\n";
            try {
                await Pi.authenticate(['payments'], async (payment) => {
                    log.innerHTML += "> تم لقط المعاملة: " + payment.identifier.substring(0,10) + "\\n";
                    const response = await fetch('/complete?id=' + payment.identifier, { method: 'POST' });
                    const result = await response.text();
                    log.innerHTML += "> رد السيرفر النهائي: " + result + "\\n";
                    if(result.includes("success")) alert("تم بنجاح!");
                });
            } catch (e) { log.innerHTML += "> خطأ: " + e.message; }
        }
    </script>
</body>
</html>`;
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
