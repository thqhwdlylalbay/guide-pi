const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e"; 
const MY_OLD_TXID = "7aadb13583c9982f7650e8619153f87775a80768116fcf2c2f8451ef8dfbcf17";
// المفتاح مدمج الآن بطريقة برمجية صحيحة
const API_KEY = "3a0opkidwbyqjyqkdzs0xljoux0xfqgsizvowwdtmck6bfur8tihttb9jtcf3iwr"; 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    if (request.method === "POST" && url.pathname === "/complete") {
      try {
        const paymentId = url.searchParams.get("id");
        
        // هنا السر: دمج كلمة Key مع المفتاح بدون أخطاء
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

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>محاولة الإغلاق بالمفتاح الجديد</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 20px; background: #f8f9fa; }
        .card { max-width: 400px; margin: auto; background: white; padding: 30px; border-radius: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .btn { padding: 18px; background: #00c853; color: white; border: none; border-radius: 12px; width: 100%; cursor: pointer; font-size: 18px; font-weight: bold; }
        #console { margin-top: 20px; padding: 15px; border-radius: 10px; background: #212121; color: #00e676; text-align: left; font-family: monospace; font-size: 13px; display: none; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="card">
        <h2 style="color: #2e7d32;">تم حقن المفتاح بنجاح ✅</h2>
        <p style="color: #666;">اضغطي على الزر الآن لإرسال الطلب النهائي.</p>
        <button id="btn" class="btn" onclick="run()">إصلاح المعاملة الآن</button>
        <div id="console"></div>
    </div>

    <script>
        Pi.init({ version: "2.0", sandbox: false });
        
        async function run() {
            const consoleDiv = document.getElementById('console');
            consoleDiv.style.display = "block";
            consoleDiv.innerHTML = "> بدأت عملية الربط...\\n";

            try {
                await Pi.authenticate(['payments'], async (payment) => {
                    consoleDiv.innerHTML += "> تم لقط المعاملة رقم: " + payment.identifier.substring(0,8) + "...\\n";
                    consoleDiv.innerHTML += "> جاري إرسال الطلب لمعدن باي...\\n";
                    
                    const response = await fetch('/complete?id=' + payment.identifier, { method: 'POST' });
                    const result = await response.text();
                    
                    consoleDiv.innerHTML += "> رد النظام النهائي: " + result + "\\n";
                    
                    if(result.includes("success") || result.includes("already")) {
                        consoleDiv.innerHTML += "> ✅ العملية تمت! تم فك الحظر.";
                        alert("مبروك! المفتاح اشتغل والعملية انتهت.");
                    }
                });
            } catch (e) {
                consoleDiv.innerHTML += "> ❌ خطأ: " + e.message;
            }
        }
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
