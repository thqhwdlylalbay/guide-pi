const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain" } });
    }

    if (request.method === "POST" && url.pathname === "/payment/complete") {
      try {
        const { paymentId, txid } = await request.json();
        
        // هنا يتم سحب المفتاح السري من إعدادات Cloudflare بأمان
        const API_KEY = env.PI_API_KEY; 

        if (!API_KEY) {
          return new Response(JSON.stringify({ error: "المفتاح غير معرف في Cloudflare" }), { status: 500 });
        }

        const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
          method: "POST",
          headers: { 
            "Authorization": `Key ${API_KEY}`,
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ txid })
        });
        const result = await res.text();
        return new Response(result);
      } catch (err) {
        return new Response(err.message, { status: 500 });
      }
    }

    // واجهة المستخدم (لا تحتوي على أي مفاتيح)
    return new Response(`
<!DOCTYPE html>
<html>
<head>
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>اختبار الأمان</title>
</head>
<body style="text-align:center; padding:50px; font-family:sans-serif;">
    <div style="padding:20px; border:2px solid #6200ee; border-radius:20px;">
        <h2>اختبار الدفع الآمن 🔒</h2>
        <p>تم إخفاء المفتاح في إعدادات السيرفر.</p>
        <button id="payBtn" style="background:#6200ee; color:white; padding:15px; border-radius:10px; border:none; width:100%;">دفع للاختبار (0.01 Pi)</button>
        <div id="status" style="margin-top:20px;"></div>
    </div>
    <script>
        Pi.init({ version: "2.0", sandbox: false });
        document.getElementById('payBtn').onclick = async () => {
            const status = document.getElementById('status');
            try {
                await Pi.createPayment({ amount: 0.01, memo: "Secure Test", metadata: {test: true} }, {
                    onReadyForServerCompletion: async (paymentId, txid) => {
                        status.innerHTML = "جاري التأكيد السري...";
                        const res = await fetch('/payment/complete', {
                            method: 'POST',
                            body: JSON.stringify({ paymentId, txid })
                        });
                        const out = await res.text();
                        status.innerHTML = out.includes("success") ? "✅ نجح الأمان!" : "❌ رد: " + out;
                    }
                });
            } catch (e) { status.innerHTML = "خطأ: " + e.message; }
        };
    </script>
</body>
</html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
