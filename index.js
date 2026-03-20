const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e"; 
const MY_OLD_TXID = "7aadb13583c9982f7650e8619153f87775a80768116fcf2c2f8451ef8dfbcf17";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    if (request.method === "POST" && url.pathname === "/complete") {
      const paymentId = url.searchParams.get("id");
      
      // فحص سريع: هل السيرفر شايف المفتاح؟
      if (!env.PI_API_KEY) {
        return new Response(JSON.stringify({ error: "المفتاح غير موجود في إعدادات Cloudflare" }), { status: 400 });
      }

      const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: "POST",
        headers: { 
          "Authorization": "Key " + env.PI_API_KEY, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ txid: MY_OLD_TXID })
      });
      return new Response(await res.text());
    }

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>إصلاح المعاملة</title>
</head>
<body style="text-align:center; padding:50px; font-family:sans-serif;">
    <h3>محاولة إنهاء المعاملة برقم:</h3>
    <code style="word-break:break-all;">${MY_OLD_TXID}</code>
    <br><br>
    <button style="padding:20px; background:blue; color:white; border:none; border-radius:10px;" onclick="fix()">اضغط هنا للإصلاح</button>
    <script>
        Pi.init({ version: "2.0", sandbox: false });
        async function fix() {
            try {
                await Pi.authenticate(['payments'], async (payment) => {
                    const res = await fetch('/complete?id=' + payment.identifier, { method: 'POST' });
                    const text = await res.text();
                    alert("رد السيرفر النهائي: " + text);
                });
            } catch (e) { alert(e.message); }
        }
    </script>
</body>
</html>`;
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
