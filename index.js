const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. ملف التحقق الخاص بباي (لازم يفضل موجود)
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain" } });
    }

    // 2. معالجة إتمام الدفع (Server-Side) - بتستخدم المفتاح السري من Cloudflare
    if (request.method === "POST" && url.pathname === "/payment/complete") {
      try {
        const { paymentId, txid } = await request.json();
        const API_KEY = env.PI_API_KEY; // بيسحب المفتاح بأمان من إعدادات كولد فلير

        if (!API_KEY) {
          return new Response(JSON.stringify({ error: "API Key missing in Cloudflare settings" }), { status: 500 });
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

    // 3. واجهة المستخدم (Client-Side) - بتطلب إذن المستخدم أولاً
    return new Response(`
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>تفعيل مشروع ثقة ودليل الباي</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 30px; background: #f0f2f5; }
        .container { max-width: 400px; margin: auto; background: white; padding: 25px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border-top: 6px solid #6200ee; }
        .btn { background: #6200ee; color: white; padding: 18px; border-radius: 12px; border: none; width: 100%; font-size: 18px; cursor: pointer; font-weight: bold; }
        #status { margin-top: 20px; font-size: 14px; color: #555; white-space: pre-wrap; text-align: right; }
    </style>
</head>
<body>
    <div class="container">
        <h2 style="color: #6200ee;">تنشيط التطبيق الآمن 🔒</h2>
        <p>الخطوة الأخيرة لتفعيل الخطوة 10 في الـ Checklist.</p>
        <button class="btn" onclick="startSecurePayment()">دفع 0.01 Pi لتأكيد الربط</button>
        <div id="status"></div>
    </div>

    <script>
        Pi.init({ version: "2.0", sandbox: false });

        async function startSecurePayment() {
            const status = document.getElementById('status');
            status.innerHTML = "> جاري طلب الأذونات من محفظتك...\\n";
            
            try {
                // طلب الإذن (Scope) أولاً لضمان عدم التعليق
                const auth = await Pi.authenticate(['payments']);
                status.innerHTML += "> تم الحصول على إذن الدفع ✅\\n";

                const payment = await Pi.createPayment({
                    amount: 0.01,
                    memo: "تفعيل الخطوة 10 - مشروع ثقة",
                    metadata: { type: "activation" }
                }, {
                    onReadyForServerApproval: (id) => { status.innerHTML += "> المعاملة معتمدة من باي..\\n"; },
                    onReadyForServerCompletion: async (paymentId, txid) => {
                        status.innerHTML += "> جاري التأكيد النهائي من السيرفر...\\n";
                        const response = await fetch('/payment/complete', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ paymentId, txid })
                        });
                        const result = await response.text();
                        if(result.includes("success")) {
                            status.innerHTML += "> ✅ تم بنجاح! مبروك تفعيل الخطوة 10.";
                            alert("نجحت العملية! يمكنك الآن التحقق من قائمة المطورين.");
                        } else {
                            status.innerHTML += "> ❌ الرد: " + result;
                        }
                    },
                    onCancel: () => { status.innerHTML = "تم إلغاء العملية."; },
                    onError: (error) => { status.innerHTML = "خطأ في الدفع: " + error.message; }
                });
            } catch (err) {
                status.innerHTML = "فشل في تسجيل الدخول: " + err.message;
            }
        }
    </script>
</body>
</html>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
