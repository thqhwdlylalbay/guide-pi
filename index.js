// كود Cloudflare Worker الكامل والنهائي
const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trust and Pi Guide</title>
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #f4f4f9; }
        .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: inline-block; }
        .btn { background-color: #673ab7; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 18px; cursor: pointer; font-weight: bold; }
        #status { margin-top: 20px; color: #555; }
    </style>
</head>
<body>
    <div class="card">
        <h2>بوابة دفع ثقة ودليل الباي</h2>
        <p>المبلغ المطلوب: 0.5 Pi</p>
        <button id="pay-btn" class="btn">دفع الآن ⚡</button>
        <div id="status">جاري التحقق من المتصفح...</div>
    </div>

    <script>
        const Pi = window.Pi;
        async function initPi() {
            try {
                await Pi.init({ version: "2.0", sandbox: true });
                document.getElementById('status').innerText = "✅ جاهز للدفع داخل Pi Browser";
            } catch (e) {
                document.getElementById('status').innerText = "⚠️ من فضلك افتحي من Pi Browser";
            }
        }
        initPi();

        document.getElementById('pay-btn').onclick = async () => {
            try {
                const payment = await Pi.createPayment({
                    amount: 0.5,
                    memo: "Test Order #" + Math.floor(Math.random() * 1000),
                    metadata: { internal_id: "order_" + Date.now() }
                }, {
                    onReadyForServerApproval: (id) => {
                        return fetch("/approve?id=" + id, { method: "POST" });
                    },
                    onReadyForServerCompletion: (id, txid) => {
                        alert("تمت العملية بنجاح! رقم العملية: " + txid);
                    },
                    onCancel: (id) => { console.log("Canceled"); },
                    onError: (error) => { alert("خطأ: " + error.message); }
                });
            } catch (err) {
                alert("خطأ فني: " + err.message);
            }
        };
    </script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // جزء الموافقة على العملية من السيرفر
    if (url.pathname === "/approve" && request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      const response = await fetch(\`https://api.minepi.com/v2/payments/\${paymentId}/approve\`, {
        method: "POST",
        headers: {
          "Authorization": \`Key \${env.PI_API_KEY}\`,
          "Content-Type": "application/json"
        }
      });
      return new Response(await response.text(), { status: 200 });
    }

    // عرض الصفحة الرئيسية
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
