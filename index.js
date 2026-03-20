// كود التحقق الخاص بك (اتركه كما هو لضمان استمرار تفعيل الدومين)
const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e"; 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. الحفاظ على تفعيل الخطوة 8 (مهم جداً)
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain" } });
    }

    // 2. كود الموافقة (Approve) - بيخلي Cloudflare يكلم سيرفر باي يوافق
    if (url.pathname === "/approve" && request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
        method: "POST",
        headers: { "Authorization": `Key ${env.PI_API_KEY}` }
      });
      return new Response(await res.text());
    }

    // 3. كود الإكمال (Complete) - لحل مشكلة المعاملات المعلقة
    if (url.pathname === "/complete" && request.method === "POST") {
      const paymentId = url.searchParams.get("id");
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

    // 4. واجهة المستخدم (الزر اللي هيظهر فيه الدفع)
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>ثقة ودليل الباي - نظام الدفع</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; background: #eee; }
        .card { background: white; padding: 30px; border-radius: 15px; display: inline-block; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
        .btn { background: #673ab7; color: white; border: none; padding: 15px 30px; border-radius: 8px; font-size: 20px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="card">
        <h1>مشروع ثقة ودليل الباي</h1>
        <p>اضغط لبدء المعاملة (ستحتاج موافقة السيرفر)</p>
        <button class="btn" onclick="startPay()">دفع 0.1 Pi</button>
    </div>

    <script>
        Pi.init({ version: "2.0", sandbox: false });

        async function startPay() {
            try {
                const payment = await Pi.createPayment({
                    amount: 0.1,
                    memo: "تجربة دفع معلقة - مشروع الثقة",
                    metadata: { type: "admin_approval" },
                }, {
                    onReadyForServerApproval: (id) => {
                        console.log("جاري طلب موافقة السيرفر...");
                        fetch('/approve?id=' + id, { method: 'POST' });
                    },
                    onReadyForServerCompletion: (id, txid) => {
                        console.log("جاري إنهاء المعاملة...");
                        fetch('/complete?id=' + id + '&txid=' + txid, { method: 'POST' })
                        .then(() => alert("تمت العملية بنجاح! رقم العملية: " + txid));
                    },
                    onCancel: (id) => alert("تم إلغاء العملية"),
                    onError: (err) => alert("خطأ: " + err.message),
                });
            } catch (e) { alert(e.message); }
        }
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
