const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ثقة ودليل الباي - تجربة الدفع</title>
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 40px 20px; background-color: #f8f9fa; color: #333; }
        .card { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); display: inline-block; max-width: 350px; width: 100%; }
        h1 { color: #673ab7; font-size: 24px; margin-bottom: 10px; }
        p { color: #666; margin-bottom: 25px; }
        .btn { background-color: #673ab7; color: white; padding: 16px; border: none; border-radius: 12px; font-size: 18px; cursor: pointer; font-weight: bold; width: 100%; transition: transform 0.2s; }
        .btn:active { transform: scale(0.98); }
        #status { margin-top: 20px; font-size: 14px; color: #888; min-height: 40px; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="card">
        <h1>بوابة دفع تجريبية</h1>
        <p>سيتم دفع 0.2 Pi (Testnet)</p>
        <button id="pay-button" class="btn">دفع الآن ⚡</button>
        <div id="status">جاري تهيئة الاتصال...</div>
    </div>

    <script>
        const Pi = window.Pi;
        const statusDiv = document.getElementById('status');

        async function initPi() {
            try {
                // تفعيل الساندبوكس للتيست نت
                await Pi.init({ version: "2.0", sandbox: true });
                statusDiv.innerText = "✅ جاهز للدفع من Pi Browser";
                
                // تسجيل الدخول التلقائي لربط الحساب
                await Pi.authenticate(['payments'], async (payment) => {
                    console.log("Authenticated");
                });
            } catch (err) {
                statusDiv.innerText = "⚠️ تنبيه: يرجى الفتح من تطبيق Pi Browser";
            }
        }
        
        initPi();

        document.getElementById('pay-button').onclick = async () => {
            statusDiv.innerText = "⏳ جاري فتح المحفظة...";
            
            try {
                await Pi.createPayment({
                    amount: 0.2,
                    memo: "تجربة دفع تيست نت 0.2",
                    metadata: { order_id: "test_" + Date.now() }
                }, {
                    onReadyForServerApproval: async (paymentId) => {
                        statusDiv.innerText = "⏳ جاري تأكيد السيرفر...";
                        await fetch("/approve?id=" + paymentId, { method: "POST" });
                    },
                    onReadyForServerCompletion: async (paymentId, txid) => {
                        statusDiv.innerText = "✅ نجحت العملية! رقم العملية: " + txid;
                        alert("تم الدفع بنجاح!");
                    },
                    onCancel: (paymentId) => {
                        statusDiv.innerText = "❌ تم إلغاء العملية";
                    },
                    onError: (error, payment) => {
                        statusDiv.innerText = "⚠️ خطأ: " + error.message;
                        // لو فيه عملية معلقة الكود هيحاول يظهرها هنا
                        if(error.message.includes("pending")) {
                            alert("لديك عملية قديمة معلقة، انتظر دقيقتين وحاول مجدداً");
                        }
                    }
                });
            } catch (err) {
                alert("يجب ضغط الزرار من داخل Pi Browser فقط");
            }
        };
    </script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // معالجة طلب التأكيد من سيرفر باي
    if (url.pathname === "/approve" && request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      try {
        const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
          method: "POST",
          headers: {
            "Authorization": `Key ${env.PI_API_KEY}`,
            "Content-Type": "application/json"
          }
        });
        const result = await response.text();
        return new Response(result, { status: 200 });
      } catch (e) {
        return new Response("Error: " + e.message, { status: 500 });
      }
    }

    // عرض الصفحة الرئيسية
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
