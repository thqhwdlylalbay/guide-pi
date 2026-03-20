const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain" } });
    }

    // جزء معالجة الدفع السحابي (Server-side)
    if (request.method === "POST" && url.pathname === "/payment/complete") {
      const { paymentId, txid } = await request.json();
      const API_KEY = "zyvmbsgd34hfnvzncx5y1laa9vglewchvytvs2hlh3y3b3peqlib6qqzjwcrqnj0"; // حطي المفتاح الجديد هنا

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
    }

    // واجهة المستخدم (Client-side)
    const html = `
<!DOCTYPE html>
<html>
<head>
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>تجربة الخطوة 10</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; background: #eee; }
        .pay-btn { background: #6200ee; color: white; padding: 20px; border-radius: 15px; border: none; font-size: 20px; width: 100%; cursor: pointer; }
        #status { margin-top: 20px; color: #555; font-weight: bold; }
    </style>
</head>
<body>
    <div style="background: white; padding: 30px; border-radius: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
        <h2>اختبار الدفع الجديد ⚡</h2>
        <p>اضغطي بالأسفل لتجربة دفع 0.01 Pi</p>
        <button class="pay-btn" onclick="pay()">دفع الآن للاختبار</button>
        <div id="status"></div>
    </div>

    <script>
        Pi.init({ version: "2.0", sandbox: false });

        async function pay() {
            const status = document.getElementById('status');
            status.innerHTML = "جاري تحضير المعاملة...";
            
            try {
                const payment = await Pi.createPayment({
                    amount: 0.01,
                    memo: "اختبار الخطوة 10",
                    metadata: { test: "true" }
                }, {
                    onReadyForServerApproval: (paymentId) => {
                        status.innerHTML = "تمت الموافقة.. جاري التأكيد من باي...";
                    },
                    onReadyForServerCompletion: async (paymentId, txid) => {
                        status.innerHTML = "جاري إنهاء المعاملة على السيرفر...";
                        const response = await fetch('/payment/complete', {
                            method: 'POST',
                            body: JSON.stringify({ paymentId, txid })
                        });
                        const result = await response.text();
                        if(result.includes("success") || result.includes("already")) {
                            status.innerHTML = "✅ نجحت المعاملة! الخطوة 10 كملت.";
                            alert("مبروك! العملية تمت بنجاح.");
                        } else {
                            status.innerHTML = "❌ الرد: " + result;
                        }
                    },
                    onCancel: () => status.innerHTML = "تم إلغاء العملية",
                    onError: (error) => status.innerHTML = "خطأ: " + error.message
                });
            } catch (err) {
                status.innerHTML = "فشل: " + err.message;
            }
        }
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
