const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ثقة ودليل الباي</title>
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f4f4f9; }
        .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: inline-block; max-width: 400px; }
        .btn { background-color: #673ab7; color: white; padding: 15px 35px; border: none; border-radius: 8px; font-size: 18px; cursor: pointer; width: 100%; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>تجربة شبكة التيست نت</h1>
        <button id="pay-button" class="btn">دفع 0.2 Pi (تجريبي)</button>
        <div id="status" style="margin-top:20px;">جاري التحقق...</div>
    </div>
    <script>
        const Pi = window.Pi;
        async function init() {
            try {
                await Pi.init({ version: "2.0", sandbox: true }); // خليناها true للتجربة
                document.getElementById('status').innerText = "✅ متصل بالتيست نت";
            } catch (e) { document.getElementById('status').innerText = e.message; }
        }
        init();

        document.getElementById('pay-button').onclick = async () => {
            try {
                await Pi.createPayment({
                    amount: 0.1, memo: "Test Payment", metadata: { type: "test" }
                }, {
                    onReadyForServerApproval: (id) => fetch("/approve?id=" + id, { method: "POST" }),
                    onReadyForServerCompletion: (id, txid) => { alert("نجحت التجربة!"); },
                    onCancel: (id) => { },
                    onError: (e) => { alert("الخطأ: " + e.message); }
                });
            } catch (err) { alert("افتحي من Pi Browser"); }
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
        headers: { "Authorization": "Key " + env.PI_API_KEY }
      });
      return new Response(await res.text());
    }
    return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
  }
};
