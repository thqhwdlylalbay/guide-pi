const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e"; 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // الخطوة 8
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    // أوامر السيرفر (Approve & Complete)
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
          headers: { "Authorization": "Key " + env.PI_API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ txid: txid || "no_txid" })
        });
        return new Response(await res.text());
      }
    }

    // واجهة المستخدم
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>ثقة ودليل الباي</title>
</head>
<body style="text-align:center; padding:50px; font-family:sans-serif; background:#f4f4f4;">
    <div style="background:white; padding:30px; border-radius:15px; display:inline-block; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
        <h2>مشروع ثقة ودليل الباي</h2>
        <div id="msg" style="margin-bottom:20px; color:#666;">جاري تهيئة النظام...</div>
        <button id="payBtn" style="display:none; padding:15px 30px; background:#673ab7; color:white; border:none; border-radius:10px; cursor:pointer; font-size:18px;" onclick="pay()">دفع 0.1 Pi</button>
    </div>

    <script>
        // دالة إنهاء المعاملات القديمة
        async function onIncompletePaymentFound(payment) {
            document.getElementById('msg').innerText = "وجدنا معاملة معلقة.. جاري تنظيفها";
            await fetch('/complete?id=' + payment.identifier + '&txid=' + payment.transaction.txid, { method: 'POST' });
            alert("تم إكمال المعاملة المعلقة! الصفحة ستعيد التحميل الآن.");
            location.reload();
        };

        // تشغيل النظام
        window.onload = function() {
            setTimeout(async () => {
                try {
                    await Pi.init({ version: "2.0", sandbox: false });
                    console.log("SDK Initialized");
                    
                    // تسجيل الدخول وفحص المعاملات المعلقة
                    await Pi.authenticate(['payments'], onIncompletePaymentFound);
                    
                    document.getElementById('msg').innerText = "النظام جاهز";
                    document.getElementById('payBtn').style.display = 'inline-block';
                } catch (e) {
                    document.getElementById('msg').innerText = "خطأ في التشغيل: " + e.message;
                }
            }, 1000); // تأخير ثانية واحدة لضمان تحميل المكتبة
        };

        async function pay() {
            try {
                await Pi.createPayment({
                    amount: 0.1,
                    memo: "تجربة دفع جديدة",
                    metadata: { type: "test" }
                }, {
                    onReadyForServerApproval: (id) => fetch('/approve?id=' + id, { method: 'POST' }),
                    onReadyForServerCompletion: (id, txid) => fetch('/complete?id=' + id + '&txid=' + txid, { method: 'POST' }),
                    onCancel: (id) => alert("تم الإلغاء"),
                    onError: (error) => alert("خطأ: " + error.message)
                });
            } catch (e) { alert(e.message); }
        }
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
