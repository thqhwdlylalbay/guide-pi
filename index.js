const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ثقة ودليل الباي</title>
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f4f4f9; }
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
        <div id="status">جاري التحقق...</div>
    </div>

    <script>
        const Pi = window.Pi;
        async function init() {
            try {
                await Pi.init({ version: "2.0", sandbox: true });
                document.getElementById('status').innerText = "✅ متصل بـ Pi Browser";
            } catch (e) {
                document.getElementById('status').innerText = "⚠️ افتحي من Pi Browser";
            }
        }
        init();

        document.getElementById('pay-btn').onclick = async () => {
            try {
                await Pi.createPayment({
                    amount: 0.5,
                    memo: "Test Order New",
                    metadata: { order_id: "order_" + Date.now() }
                }, {
                    onReadyForServerApproval: (id) => fetch("/approve?id=" + id, { method: "POST" }),
                    onReadyForServerCompletion: (id, txid) => alert("تمت العملية بنجاح!"),
                    onCancel: (id) => console.log("Canceled"),
                    onError: (error) => alert("خطأ: " + error.message)
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
    if (url.pathname === "/approve" && request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      const res = await fetch("https://api.minepi.com/v2/payments/" + paymentId + "/approve", {
        method: "POST",
        headers: {
          "Authorization": "Key " + env.PI_API_KEY,
          "Content-Type": "application/json"
        }
      });
      return new Response(await res.text(), { status: 200 });
    }
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
