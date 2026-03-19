// 1. كود واجهة المستخدم (HTML/JavaScript)
// ده الجزء المسؤول عن شكل الزرار وفتح المحفظة في الموبايل
const htmlPage = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trust and Pi Guide</title>
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f4f4f9; }
        .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: inline-block; }
        .btn { background-color: #673ab7; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 18px; cursor: pointer; font-weight: bold; }
        .btn:disabled { background-color: #ccc; }
    </style>
</head>
<body>
    <div class="card">
        <h2>بوابة دفع ثقة ودليل الباي</h2>
        <p>المبلغ: 0.5 Pi</p>
        <button id="pay-button" class="btn" disabled>جاري التحميل...</button>
        <p id="status"></p>
    </div>

    <script>
        const Pi = window.Pi;
        async function init() {
            try {
                await Pi.init({ version: "2.0", sandbox: true });
                await Pi.authenticate(['payments'], (p) => {});
                document.getElementById('pay-button').disabled = false;
                document.getElementById('pay-button').innerText = 'دفع الآن ⚡';
            } catch (e) {
                document.getElementById('status').innerText = '⚠️ افتحي من Pi Browser';
            }
        }
        init();

        document.getElementById('pay-button').onclick = async () => {
            try {
                await Pi.createPayment({
                    amount: 0.5,
                    memo: "Test Transaction",
                    metadata: { order_id: "order_" + Date.now() }
                }, {
                    // هنا بننادي على السيرفر (الجزء اللي تحت في الملف) عشان يوافق
                    onReadyForServerApproval: (id) => fetch("/approve?id=" + id, { method: "POST" }),
                    onReadyForServerCompletion: (id, txid) => alert("نجحت العملية!"),
                    onCancel: (id) => alert("تم الإلغاء"),
                    onError: (e) => alert("خطأ: " + e.message)
                });
            } catch (err) {
                alert(err.message);
            }
        };
    </script>
</body>
</html>
`;

// 2. كود السيرفر (Backend)
// ده الجزء المسؤول عن مراسلة شركة باي والموافقة على العملية (Approve)
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // لو الطلب جاي للموافقة على الدفع
    if (url.pathname === "/approve" && request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      
      // بنكلم سيرفر باي الرسمي ونبعت الـ API Key المخفي في الإعدادات
      const piResponse = await fetch("https://api.minepi.com/v2/payments/" + paymentId + "/approve", {
        method: "POST",
        headers: {
          "Authorization": "Key " + env.PI_API_KEY,
          "Content-Type": "application/json"
        }
      });
      
      const result = await piResponse.text();
      return new Response(result, { status: 200 });
    }

    // لو الطلب عادي، بنعرض صفحة الـ HTML
    return new Response(htmlPage, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
