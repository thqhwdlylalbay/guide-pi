const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trust and Pi Guide</title>
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 40px; background: #f4f4f9; }
        .payment-card { background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: inline-block; }
        .pi-button { background-color: #673ab7; color: white; padding: 15px 35px; border: none; border-radius: 10px; font-size: 20px; cursor: pointer; font-weight: bold; }
        .pi-button:disabled { background-color: #ccc; cursor: not-allowed; }
        #status { margin-top: 15px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="payment-card">
        <h2>بوابة دفع Pi الرسمية</h2>
        <p>مبلغ التجربة: 0.5 Pi</p>
        <button id="buy-button" class="pi-button" disabled>انتظار الاتصال...</button>
        <div id="status">جاري تهيئة SDK...</div>
    </div>

    <script>
        const Pi = window.Pi;
        const btn = document.getElementById('buy-button');
        const status = document.getElementById('status');

        async function initApp() {
            try {
                // تفعيل النسخة التجريبية (Sandbox)
                await Pi.init({ version: "2.0", sandbox: true });
                
                // خطوة المصادقة (Authentication) اللي الفيديو ركز عليها
                await Pi.authenticate(['payments'], (payment) => {
                    console.log("Authenticated");
                });

                btn.disabled = false;
                btn.innerText = "دفع بـ Pi الآن";
                status.innerText = "✅ المتصفح جاهز للعملية";
            } catch (err) {
                status.innerText = "⚠️ خطأ: يرجى الفتح من Pi Browser";
            }
        }

        initApp();

        btn.onclick = async () => {
            btn.disabled = true;
            status.innerText = "⏳ جاري فتح المحفظة...";
            
            try {
                const payment = await Pi.createPayment({
                    amount: 0.5,
                    memo: "شراء من تطبيق ثقة ودليل الباي",
                    metadata: { order_id: "vid_" + Date.now() }
                }, {
                    onReadyForServerApproval: (id) => {
                        status.innerText = "⏳ جاري تأكيد السيرفر (Approve)...";
                        return fetch("/approve?id=" + id, { method: "POST" });
                    },
                    onReadyForServerCompletion: (id, txid) => {
                        status.innerText = "✅ نجح الدفع! رقم المعاملة: " + txid;
                        alert("مبروك! تمت العملية بنجاح");
                    },
                    onCancel: (id) => {
                        btn.disabled = false;
                        status.innerText = "❌ تم إلغاء العملية";
                    },
                    onError: (error) => {
                        btn.disabled = false;
                        alert("خطأ: " + error.message);
                    }
                });
            } catch (e) {
                btn.disabled = false;
                alert("عطل فني: " + e.message);
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
      // هذا الجزء هو "الخلفية" (Backend) اللي الفيديو شرحه في دقيقة 13:50
      const res = await fetch("https://api.minepi.com/v2/payments/" + paymentId + "/approve", {
        method: "POST",
        headers: {
          "Authorization": "Key " + env.PI_API_KEY,
          "Content-Type": "application/json"
        }
      });
      return new Response(await res.text(), { status: 200 });
    }
    return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
  }
};
