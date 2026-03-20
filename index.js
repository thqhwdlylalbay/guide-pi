const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e"; 
const MY_OLD_TXID = "7aadb13583c9982f7650e8619153f87775a80768116fcf2c2f8451ef8dfbcf17";
const EMERGENCY_API_KEY = "3a0opkidwbyqjyqkdzs0xljoux0xfqgsizvowwdtmck6bfur8tihttb9jtcf3iwr"; // <--- حط المفتاح السري بتاعك هنا بين العلامتين

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    if (request.method === "POST" && url.pathname === "/complete") {
      try {
        const paymentId = url.searchParams.get("id");
        
        // استخدام المفتاح المكتوب يدوياً لتجنب مشاكل الإعدادات
        const apiKey = EMERGENCY_API_KEY; 

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

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>إصلاح نهائي</title>
</head>
<body style="text-align:center; padding:30px; font-family:sans-serif; background:#f4f4f4;">
    <div style="max-width:400px; margin:auto; background:white; padding:20px; border-radius:15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h2>محاولة الإصلاح اليدوي</h2>
        <p>سيتم استخدام المفتاح المدمج لإنهاء المعاملة المعلقة</p>
        <button id="btn" style="padding:15px; background:#e91e63; color:white; border:none; border-radius:10px; width:100%; cursor:pointer;" onclick="fix()">إرسال أمر الإنهاء</button>
        <div id="result" style="margin-top:20px; padding:10px; border-radius:5px; display:none; background:#eee; word-break:break-all;"></div>
    </div>
    <script>
        Pi.init({ version: "2.0", sandbox: false });
        async function fix() {
            const btn = document.getElementById('btn');
            const resDiv = document.getElementById('result');
            btn.disabled = true;
            try {
                await Pi.authenticate(['payments'], async (payment) => {
                    const response = await fetch('/complete?id=' + payment.identifier, { method: 'POST' });
                    const result = await response.text();
                    resDiv.style.display = "block";
                    resDiv.innerText = "رد السيرفر: " + result;
                    if (result.includes("success") || result.includes("already")) alert("مبروك! اتحلت المشكلة.");
                });
            } catch (e) {
                alert("خطأ: " + e.message);
                btn.disabled = false;
            }
        }
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
