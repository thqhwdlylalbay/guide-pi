const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trust and Pi Guide - Test</title>
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f0f2f5; }
        .container { background: white; padding: 30px; border-radius: 20px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); display: inline-block; }
        .btn { background-color: #673ab7; color: white; padding: 15px 30px; border: none; border-radius: 10px; font-size: 18px; cursor: pointer; font-weight: bold; }
        #msg { margin-top: 20px; color: #555; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>تجربة دفع نهائية</h1>
        <p>المبلغ المطلوب: 0.5 Pi</p>
        <button id="btn-pay" class="btn">دفع الآن ⚡</button>
        <div id="msg">جاري التحقق...</div>
    </div>

    <script>
        const Pi = window.Pi;
        async function init() {
            try {
                await Pi.init({ version: "2.0", sandbox: true });
                document.getElementById('msg').innerText = "✅ متصل بالـ Testnet";
            } catch (e) {
                document.getElementById('msg').innerText = "⚠️ افتحي من Pi Browser";
            }
        }
        init();

        document.getElementById('btn-pay').onclick = async () => {
            document.getElementById('msg').innerText = "⏳ جاري محاولة فتح المحفظة...";
            try {
                await Pi.createPayment({
                    amount: 0.5,
                    memo: "New Test Order 55",
                    metadata: { order_id: "order_id_" + Math.floor(Math.random() * 1000000) } // رقم عشوائي لكسر التعليقة
                }, {
                    onReadyForServerApproval: (id) => fetch("/approve?id=" + id, { method: "POST" }),
                    onReadyForServerCompletion: (id, txid) => { alert("نجحت!"); },
                    onCancel: (id) => { document.getElementById('msg').innerText = "❌ تم الإلغاء"; },
                    onError: (e) => { 
                        alert("الخطأ: " + e.message);
                        document.getElementById('msg').innerText = "خطأ: " + e.message;
                    }
                });
            } catch (err) {
                alert("يجب الفتح من Pi Browser");
            }
        };
    </script>
</body>
</html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/approve" && request.method === "POST") {
      const id = url.searchParams.get("id");
      const res = await fetch("https://api.minepi.com/v2/payments/" + id + "/approve", {
        method: "POST",
        headers: { 
            "Authorization": "Key " + env.PI_API_KEY,
            "Content-Type": "application/json"
        }
      });
      return new Response(await res.text());
    }
    return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
  }
};
