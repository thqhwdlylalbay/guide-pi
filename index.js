// هذا الكود هو النموذج المعتمد في مستودعات GitHub الرسمية لمطوري Pi
// يتميز بفصل العمليات لضمان أقصى درجات الأمان والسرعة

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. معالجة طلبات الموافقة والإكمال (Server-Side Logic)
    if (url.pathname === "/approve" || url.pathname === "/complete") {
      const paymentId = url.searchParams.get("id");
      const endpoint = url.pathname === "/approve" ? "approve" : "complete";

      try {
        const response = await fetch("https://api.minepi.com/v2/payments/" + paymentId + "/" + endpoint, {
          method: "POST",
          headers: { 
            "Authorization": "Key " + env.PI_API_KEY,
            "Content-Type": "application/json"
          }
        });
        
        const result = await response.json();
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    // 2. واجهة المستخدم الرسمية (Standard UI)
    const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Trust Pi Guide - Mainnet</title>
      <script src="https://sdk.minepi.com/pi-sdk.js"></script>
      <style>
        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0f2f5; }
        .container { text-align: center; background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        button { background: #673ab7; color: white; border: none; padding: 15px 30px; border-radius: 12px; font-size: 18px; cursor: pointer; transition: 0.3s; }
        button:hover { background: #5e35b1; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>ثقة ودليل الباي</h1>
        <p>توثيق الخطوة العاشرة (Mainnet)</p>
        <button id="payBtn">دفع 0.1 Pi الآن</button>
        <p id="msg"></p>
      </div>

      <script>
        const Pi = window.Pi;
        Pi.init({ version: "2.0" });

        document.getElementById('payBtn').onclick = async () => {
          const msg = document.getElementById('msg');
          msg.innerText = "جاري فتح المحفظة...";
          
          try {
            await Pi.createPayment({
              amount: 0.1,
              memo: "Mainnet Checklist Step 10",
              metadata: { orderId: "step-10-verification" }
            }, {
              onReadyForServerApproval: (id) => fetch('/approve?id=' + id).then(r => r.json()),
              onReadyForServerCompletion: (id) => fetch('/complete?id=' + id).then(r => r.json()),
              onCancel: () => msg.innerText = "تم إلغاء العملية",
              onError: (e) => msg.innerText = "خطأ: " + e.message
            });
          } catch (err) {
            msg.innerText = "يرجى استخدام Pi Browser";
          }
        };
      </script>
    </body>
    </html>`;

    return new Response(html, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
  }
};
