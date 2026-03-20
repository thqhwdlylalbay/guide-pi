// 1. كود التحقق (Validation Key) للحفاظ على تفعيل الخطوة 8
const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e"; 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // --- مسار التحقق للخطوة 8 ---
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" }
      });
    }

    // --- نظام معالجة الدفع (Approve & Complete) ---
    if (request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      
      if (url.pathname === "/approve") {
        const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
          method: "POST",
          headers: { "Authorization": "Key " + env.PI_API_KEY }
        });
        return new Response(await res.text());
      }

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

    // --- واجهة المستخدم (HTML) ---
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>ثقة ودليل الباي</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px 20px; background: #f4f4f4; }
        .card { background: #fff; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: inline-block; }
        .btn { background: #673ab7; color: #fff; border: none; padding: 15px 30px; border-radius: 10px; cursor: pointer; font-size: 18px; width: 100%; }
        #status { margin-top: 15px; color: #555; font-size: 14px; }
    </style>
</head>
<body>
    <div class="card">
        <h1>مشروع ثقة ودليل الباي</h1>
        <p>اضغط لبدء الدفع (0.1 Pi)</p>
        <button class="btn" onclick="handlePayment()">دفع الآن</button>
        <div id="status"></div>
    </div>

    <script>
        // 1. تعريف الـ SDK
        Pi.init({ version: "2.0", sandbox: false });

        async function handlePayment() {
            const status = document.getElementById('status');
            status.innerText = "جاري طلب إذن الدفع...";

            try {
                // 2. طلب إذن الـ payments (لحل مشكلة الـ Scope)
                const scopes = ['payments'];
                const auth = await Pi.authenticate(scopes, (payment) => {
                    // إذا وجد معاملة معلقة قديمة، سيحاول إكمالها تلقائياً
                    fetch('/complete?id=' + payment.identifier + '&txid=' + payment.transaction.txid, { method: 'POST' });
                });

                status.innerText = "تم تسجيل الدخول.. فتح المحفظة الآن";

                // 3. إنشاء المعاملة
                await Pi.createPayment({
                    amount: 0.1,
                    memo: "تجربة دفع - ثقة ودليل الباي",
                    metadata: { type: "user_test" },
                }, {
                    onReadyForServerApproval: (id) => fetch('/approve?id=' + id, { method: 'POST' }),
                    onReadyForServerCompletion: (id, txid) => {
                        fetch('/complete?id=' + id + '&txid=' + txid, { method: 'POST' })
                        .then(() => {
                            status.innerText = "نجحت العملية!";
                            alert("تم الدفع بنجاح! رقم العملية: " + txid);
                        });
                    },
                    onCancel: (id) => { status.innerText = "تم إلغاء العملية"; },
                    onError: (err) => { status.innerText = "خطأ: " + err.message; alert(err.message); },
                });

            } catch (e) {
                status.innerText = "حدث خطأ أثناء المحاولة";
                alert("Error: " + e.message);
            }
        }
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
