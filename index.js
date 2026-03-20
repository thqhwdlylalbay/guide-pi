const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e"; 
const MY_OLD_TXID = "7aadb13583c9982f7650e8619153f87775a80768116fcf2c2f8451ef8dfbcf17";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // التحقق من الدومين
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    // معالجة طلب الإصلاح
    if (request.method === "POST" && url.pathname === "/complete") {
      try {
        const paymentId = url.searchParams.get("id");
        const apiKey = env.PI_API_KEY; // قراءة المفتاح من الإعدادات

        if (!apiKey) {
          return new Response(JSON.stringify({ error: "السيرفر لا يرى المفتاح، تأكد من الضغط على Save and Deploy" }), { status: 400 });
        }

        const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
          method: "POST",
          headers: { 
            "Authorization": "Key " + apiKey, 
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

    // واجهة المستخدم (صفحة الإصلاح)
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>إصلاح معاملة باي</title>
</head>
<body style="text-align:center; padding:30px; font-family:sans-serif; background-color:#f4f4f9;">
    <div style="max-width:400px; margin:auto; background:white; padding:20px; border-radius:15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2 style="color:#333;">محاولة إنهاء المعاملة</h2>
        <p style="font-size:12px; color:#666; word-break:break-all;">رقم العملية: <br><b>${MY_OLD_TXID}</b></p>
        <button id="btn" style="padding:15px 30px; background:#4A148C; color:white; border:none; border-radius:10px; font-size:18px; cursor:pointer; width:100%;" onclick="fix()">إرسال أمر الإصلاح الآن</button>
        <div id="result" style="margin-top:20px; padding:10px; border-radius:5px; display:none; word-break:break-all;"></div>
    </div>

    <script>
        Pi.init({ version: "2.0", sandbox: false });

        async function fix() {
            const btn = document.getElementById('btn');
            const resDiv = document.getElementById('result');
            btn.disabled = true;
            btn.innerText = "جاري الإرسال...";
            
            try {
                await Pi.authenticate(['payments'], async (payment) => {
                    const response = await fetch('/complete?id=' + payment.identifier, { method: 'POST' });
                    const resultText = await response.text();
                    
                    resDiv.style.display = "block";
                    resDiv.style.background = "#e1f5fe";
                    resDiv.innerHTML = "<b>رد السيرفر:</b><br>" + resultText;
                    
                    if (resultText.includes("success") || resultText.includes("already")) {
                        alert("مبروك! تم حل المشكلة بنجاح.");
                    }
                });
            } catch (e) {
                alert("خطأ في التطبيق: " + e.message);
                btn.disabled = false;
                btn.innerText = "إرسال أمر الإصلاح الآن";
            }
        }
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
