const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ثقة ودليل الباي</title>
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f4f4f9; }
        .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: inline-block; max-width: 400px; }
        .btn { background-color: #673ab7; color: white; padding: 15px 35px; border: none; border-radius: 8px; font-size: 18px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 20px; }
        #status { margin-top: 20px; font-weight: bold; min-height: 50px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>بوابة دفع ثقة ودليل الباي</h1>
        <p>توثيق الخطوة العاشرة (0.1 Pi)</p>
        <button id="pay-button" class="btn">دفع الآن</button>
        <div id="status"></div>
    </div>
    <script>
        const Pi = window.Pi;
        async function startApp() {
            try {
                await Pi.init({ version: "2.0", sandbox: false });
                // تنظيف أي عمليات معلقة فور فتح الصفحة
                await Pi.authenticate(['payments'], async (payment) => {
                    await fetch("/approve?id=" + payment.identifier, { method: "POST" });
                });
            } catch (err) {
                document.getElementById('status').innerText = "خطأ توثيق: " + err.message;
            }
        }
        startApp();

        document.getElementById('pay-button').onclick = async () => {
            const status = document.getElementById('status');
            status.innerText = "جاري فتح المحفظة...";
            try {
                await Pi.createPayment({
                    amount: 0.1,
                    memo: "Checklist Step 10",
                    metadata: { type: "step_10" },
                }, {
                    onReadyForServerApproval: (id) => fetch("/approve?id=" + id, { method: "POST" }),
                    onReadyForServerCompletion: (id, txid) => { 
                        status.innerText = "✅ تم الدفع بنجاح!"; 
                        status.style.color = "green";
                    },
                    onCancel: (id) => { status.innerText = "❌ تم إلغاء العملية"; status.style.color = "orange"; },
                    onError: (e) => { 
                        if(e.message.includes("pending")) {
                            status.innerText = "جاري معالجة عملية سابقة.. ارفرش الصفحة وجرب تاني";
                        } else {
                            status.innerText = "⚠️ عطل: " + e.message;
                        }
                    }
                });
            } catch (err) {
                status.innerText = "يرجى الفتح من Pi Browser";
            }
        };
    </script>
</body>
</html>
`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/approve" && request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      try {
        // حماية: التأكد من وجود المفتاح في الإعدادات
        if (!env.PI_API_KEY) {
            return new Response(JSON.stringify({ error: "API Key Missing" }), { status: 500 });
        }
        const response = await fetch("https://api.minepi.com/v2/payments/" + paymentId + "/approve", {
          method: "POST",
          headers: { "Authorization": "Key " + env.PI_API_KEY }
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
      }
    }
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
