// 1. حطي الكود (Validation Key) اللي كان في ملف الـ txt هنا
const validationKey = "13074bc87cb82050e631cac2243884873eabd53e19a9acfd751457bb5c50b97d68f42c55f941a83aca4597888de22b4ee4e0334282f18dba6381d8beac452758"; 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // الخطوة اللي بتخلي "باي" توافق على الرابط (الخطوة 8)
    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, {
        headers: { "Content-Type": "text/plain", "Access-Control-Allow-Origin": "*" }
      });
    }

    // كود الموافقة على الدفع (Approve)
    if (url.pathname === "/approve" && request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      const res = await fetch("https://api.minepi.com/v2/payments/" + paymentId + "/approve", {
        method: "POST",
        headers: {
          "Authorization": "Key " + env.PI_API_KEY,
          "Content-Type": "application/json"
        }
      });
      return new Response(await res.text());
    }

    // عرض ملف الـ index.html اللي إنتي بعتيه
    const html = `
<!DOCTYPE html>
<html lang="ar">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <script>
      // تشغيل الـ SDK (بدون ساندبوكس عشان يفتح المحفظة الحقيقية)
      Pi.init({ version: "2.0", sandbox: false });

      async function transfer() {
        try {
          const payment = await Pi.createPayment({
            amount: 0.1,
            memo: "تجربة دفع تطبيق الثقة",
            metadata: { test: "test_payment" },
          }, {
            onReadyForServerApproval: (paymentId) => {
              fetch('/approve?id=' + paymentId, { method: 'POST' });
            },
            onReadyForServerCompletion: (paymentId, txid) => {
              alert("نجحت العملية! رقم المعاملة: " + txid);
            },
            onCancel: (paymentId) => console.log("تم الإلغاء"),
            onError: (error, payment) => alert("خطأ: " + error.message),
          });
        } catch (err) {
          alert(err.message);
        }
      }
    </script>
    <title>ثقة ودليل الباي</title>
    <style>
      body { font-family: sans-serif; text-align: center; padding-top: 50px; background-color: #f4f4f4; }
      .btn { padding: 15px 30px; font-size: 18px; cursor: pointer; background: #673ab7; color: white; border: none; border-radius: 8px; }
    </style>
  </head>
  <body>
    <h1>مرحباً بك في مشروع ثقة ودليل الباي</h1>
    <p>اضغط أدناه لتجربة عملية الدفع (0.1 Pi)</p>
    <button class="btn" onclick="transfer()">دفع 0.1 Pi</button>
  </body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
