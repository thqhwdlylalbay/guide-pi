// 1. ضع كود التحقق الخاص بك هنا (من صفحة المطورين Step 8)
const validationKey = "pi-site-verification:13074bc87cb82050e631cac2243884873eabd53e19a9acfd751457bb5c50b97d68f42c55f941a83aca4597888de22b4ee4e0334282f18dba6381d8beac452758"; 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- إعداد ملف التحقق (.txt) للخطوة 8 ---
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, {
        headers: { 
          "Content-Type": "text/plain; charset=utf-8", 
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }

    // --- نظام الدفع (Approve & Complete) ---
    if (request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      
      if (url.pathname === "/approve") {
        const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
          method: "POST",
          headers: { "Authorization": `Key ${env.PI_API_KEY}` }
        });
        return new Response(await res.text());
      }

      if (url.pathname === "/complete") {
        const txid = url.searchParams.get("txid");
        const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
          method: "POST",
          headers: { 
            "Authorization": `Key ${env.PI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ txid })
        });
        return new Response(await res.text());
      }
    }

    // --- واجهة الموقع (HTML) ---
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>ثقة ودليل الباي</title>
    <style>
        body { font-family: sans-serif; text-align: center; background: #f4f4f4; padding-top: 50px; }
        .card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); display: inline-block; }
        .btn { background: #673ab7; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="card">
        <h1>مشروع ثقة ودليل الباي</h1>
        <button class="btn" onclick="pay()">تجربة دفع 0.1 Pi</button>
    </div>
    <script>
        Pi.init({ version: "2.0", sandbox: false });
        async function pay() {
            try {
                await Pi.createPayment({
                    amount: 0.1,
                    memo: "تجربة دفع",
                    metadata: { test: "1" },
                }, {
                    onReadyForServerApproval: (id) => fetch('/approve?id=' + id, { method: 'POST' }),
                    onReadyForServerCompletion: (id, txid) => {
                        fetch('/complete?id=' + id + '&txid=' + txid, { method: 'POST' })
                        .then(() => alert("تم النجاح! ID: " + txid));
                    },
                    onCancel: (id) => console.log("Cancelled"),
                    onError: (err) => alert("Error: " + err.message),
                });
            } catch (e) { alert(e.message); }
        }
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
