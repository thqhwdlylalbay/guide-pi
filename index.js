const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e"; 
const MY_OLD_TXID = "7aadb13583c9982f7650e8619153f87775a80768116fcf2c2f8451ef8dfbcf17";
const SECRET_KEY = "3a0opkidwbyqjyqkdzs0xljoux0xfqgsizvowwdtmck6bfur8tihttb9jtcf3iwr"; 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    if (request.method === "POST" && url.pathname === "/complete") {
      try {
        const paymentId = url.searchParams.get("id");
        
        // التعديل الجوهري هنا: إرسال الطلب بتنسيق دقيق جداً لسيرفر باي
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

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>فك التعليق النهائي</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 20px; background: #f0f2f5; }
        .card { max-width: 400px; margin: auto; background: white; padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .btn { padding: 18px; background: #673ab7; color: white; border: none; border-radius: 12px; width: 100%; cursor: pointer; font-size: 18px; font-weight: bold; }
        #log { margin-top: 20px; padding: 15px; border-radius: 10px; background: #333; color: #0f0; text-align: left; font-family: monospace; font-size: 12px; display: none; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="card">
        <h2>🚀 محاولة الإغلاق الأخيرة</h2>
        <p>الآن الكود سيرسل الـ ID والـ TXID معاً</p>
        <button id="btn" class="btn" onclick="execute()">إرسال أمر التنفيذ</button>
        <div id="log"></div>
    </div>

    <script>
        Pi.init({ version: "2.0", sandbox: false });
        
        async function execute() {
            const log = document.getElementById('log');
            log.style.display = "block";
            log.innerHTML = "> بدأت العملية...\\n";

            try {
                await Pi.authenticate(['payments'], async (payment) => {
                    log.innerHTML += "> تم لقط المعاملة: " + payment.identifier.substring(0,10) + "...\\n";
                    log.innerHTML += "> جاري إرسال الـ TXID المحفوظ...\\n";
                    
                    const response = await fetch('/complete?id=' + payment.identifier, { method: 'POST' });
                    const result = await response.text();
                    
                    log.innerHTML += "> رد السيرفر: " + result + "\\n";
                    
                    if(result.includes("success") || result.includes("already")) {
                        log.innerHTML += "> ✅ تم بنجاح! مبروك.";
                        alert("مبروك! العملية تمت بنجاح.");
                    } else {
                        log.innerHTML += "> ⚠️ الرد غير متوقع، راجع المفتاح.";
                    }
                });
            } catch (e) {
                log.innerHTML += "> ❌ خطأ: " + e.message;
            }
        }
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
