const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e"; 
const MY_OLD_TXID = "7aadb13583c9982f7650e8619153f87775a80768116fcf2c2f8451ef8dfbcf17";
// استبدلي السطر التالي بمفتاحك السري الحقيقي بين العلامات ""
const SECRET_KEY = "3a0opkidwbyqjyqkdzs0xljoux0xfqgsizvowwdtmck6bfur8tihttb9jtcf3iwr"; 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // التحقق من ملكية النطاق (الخطوة 8 في داشبورد باي)
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    // أمر إنهاء المعاملة المعلقة
    if (request.method === "POST" && url.pathname === "/complete") {
      try {
        const paymentId = url.searchParams.get("id");
        
        const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
          method: "POST",
          headers: { 
            "Authorization": "Key " + SECRET_KEY, 
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

    // واجهة الإصلاح اليدوي
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>إصلاح نهائي ومباشر</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 20px; background: #fdfdfd; }
        .card { max-width: 400px; margin: auto; background: white; padding: 25px; border-radius: 20px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); border: 1px solid #eee; }
        .btn { padding: 18px; background: #d81b60; color: white; border: none; border-radius: 12px; width: 100%; cursor: pointer; font-size: 18px; font-weight: bold; transition: 0.3s; }
        .btn:disabled { background: #ccc; }
        #result { margin-top: 20px; padding: 15px; border-radius: 10px; display: none; background: #f0f0f0; word-break: break-all; font-family: monospace; font-size: 14px; text-align: left; }
    </style>
</head>
<body>
    <div class="card">
        <h2 style="color: #333;">محاولة الإصلاح اليدوي</h2>
        <p style="color: #666;">سيتم استخدام المفتاح المدمج مباشرة لإرسال أمر الإكمال النهائي.</p>
        <button id="btn" class="btn" onclick="fix()">إرسال أمر الإنهاء الآن</button>
        <div id="result"></div>
    </div>
    <script>
        Pi.init({ version: "2.0", sandbox: false });
        async function fix() {
            const btn = document.getElementById('btn');
            const resDiv = document.getElementById('result');
            btn.disabled = true;
            resDiv.style.display = "block";
            resDiv.innerText = "جاري الاتصال بالنظام...";
            
            try {
                await Pi.authenticate(['payments'], async (payment) => {
                    resDiv.innerText = "تم تحديد المعاملة: " + payment.identifier + "\\nجاري إرسال طلب الإكمال...";
                    
                    const response = await fetch('/complete?id=' + payment.identifier, { method: 'POST' });
                    const result = await response.text();
                    
                    resDiv.innerText = "رد السيرفر النهائي:\\n" + result;
                    
                    if (result.includes("success") || result.includes("already")) {
                        alert("مبروك! تم حل المشكلة وتحديث حالة المعاملة.");
                    }
                });
            } catch (e) {
                resDiv.innerText = "خطأ في الاتصال: " + e.message;
                btn.disabled = false;
            }
        }
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
