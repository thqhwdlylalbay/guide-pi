here// 1. ضع كود التحقق (Validation Key) هنا
const validationKey = "pi-site-verification: 13074bc87cb82050e631cac2243884873eabd53e19a9acfd751457bb5c50b97d68f42c55f941a83aca4597888de22b4ee4e0334282f18dba6381d8beac452758"; 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- مسار ملف التحقق (Public .txt) للخطوة 8 ---
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, {
        headers: { 
          "Content-Type": "text/plain; charset=utf-8", 
          "Access-Control-Allow-Origin": "*" 
        }
      });
    }

    // --- نظام معالجة الدفع (Approve & Complete) ---
    if (request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      
      // الموافقة (Approve)
      if (url.pathname === "/approve") {
        const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
          method: "POST",
          headers: { "Authorization": "Key " + env.PI_API_KEY }
        });
        return new Response(await res.text());
      }

      // الإكمال (Complete)
      if (url.pathname === "/complete") {
        const txid = url.searchParams.get("txid");
        const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
          method: "POST",
          headers: { 
            "Authorization": "Key " + env.PI_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ txid })
        });
        return new Response(await res.text());
      }
    }

    // --- واجهة المستخدم (HTML) الخاصة بمشروع ثقة ودليل الباي ---
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>ثقة ودليل الباي</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px 20px; background: #f9f9f9; }
        .card { background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 400px; margin: auto; }
        .btn { background: #673ab7; color: #fff; border: none; padding: 15px 25px; border-radius: 8px; cursor: pointer; font-size: 16px; width: 100%; }
    </style>
</head>
<body>
    <div class="card">
        <h1>ثقة ودليل الباي</h1>
        <p>اختبار جاهزية التطبيق للـ Mainnet</p>
        <button class="btn" onclick="pay()">دفع 0.1 Pi</button>
    </div>
    <script>
        Pi.init({ version: "2.0", sandbox: false });
        async function pay() {
            try {
                await Pi.createPayment({
                    amount: 0.1,
                    memo: "تجربة دفع - ثقة ودليل الباي",
                    metadata: { step: "verification" },
                }, {
                    onReadyForServerApproval: (id) => fetch('/approve?id=' + id, { method: 'POST' }),
                    onReadyForServerCompletion: (id, tx) => {
                        fetch('/complete?id=' + id + '&txid=' + tx, { method: 'POST' })
                        .then(() => alert("نجحت العملية! رقم المعاملة: " + tx));
                    },
                    onCancel: (id) => console.log("Canceled"),
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
