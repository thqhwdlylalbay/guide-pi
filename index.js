const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e"; 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain" } });
    }

    // سكريبت الإكمال (مهم جداً لفك المعاملة المعلقة)
    if (url.pathname === "/complete" && request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      const txid = url.searchParams.get("txid");
      
      const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
        method: "POST",
        headers: { 
          "Authorization": `Key ${env.PI_API_KEY}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ txid: txid || "no_txid" }) 
      });
      return new Response(await res.text());
    }

    if (url.pathname === "/approve" && request.method === "POST") {
        const paymentId = url.searchParams.get("id");
        const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
          method: "POST",
          headers: { "Authorization": `Key ${env.PI_API_KEY}` }
        });
        return new Response(await res.text());
    }

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>ثقة ودليل الباي</title>
</head>
<body style="text-align:center; padding-top:50px; font-family:sans-serif;">
    <h2>مشروع ثقة ودليل الباي</h2>
    <div id="msg">جاري فحص المعاملات المعلقة...</div>
    <button id="payBtn" style="display:none; padding:15px; background:#673ab7; color:white; border:none; border-radius:10px;" onclick="pay()">دفع 0.1 Pi</button>

    <script>
        Pi.init({ version: "2.0", sandbox: false });

        // الدالة دي هي اللي "بتصطاد" أي معاملة قديمة (حتى لو من سيرفر فيرسيل)
        async function onIncompletePaymentFound(payment) {
            document.getElementById('msg').innerText = "وجدنا معاملة قديمة، جاري إنهاؤها...";
            await fetch('/complete?id=' + payment.identifier + '&txid=' + payment.transaction.txid, { method: 'POST' });
            alert("تم تنظيف المعاملة المعلقة بنجاح! جرب الآن.");
            location.reload(); // إعادة تحميل الصفحة لتنظيف الحالة
        };

        // تسجيل الدخول وطلب الإذن وفحص المعاملات دفعة واحدة
        async function init() {
            try {
                await Pi.authenticate(['payments'], onIncompletePaymentFound);
                document.getElementById('msg').innerText = "جاهز لبدء معاملة جديدة";
                document.getElementById('payBtn').style.display = 'inline-block';
            } catch(e) { document.getElementById('msg').innerText = "خطأ: " + e.message; }
        }

        async function pay() {
            await Pi.createPayment({
                amount: 0.1,
                memo: "تجربة دفع جديدة",
                metadata: { test: "1" }
            }, {
                onReadyForServerApproval: (id) => fetch('/approve?id=' + id, { method: 'POST' }),
                onReadyForServerCompletion: (id, txid) => fetch('/complete?id=' + id + '&txid=' + txid, { method: 'POST' }),
                onCancel: (id) => console.log("Cancelled"),
                onError: (id, error) => console.error(error)
            });
        }

        init();
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
