// اسم الملف: index.js
const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trust and Pi Guide</title>
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #f4f4f9; }
        .container { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .btn { background-color: #673ab7; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 18px; cursor: pointer; }
        #msg { margin-top: 20px; color: #d32f2f; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>بوابة دفع ثقة ودليل الباي</h1>
        <p>توثيق الخطوة العاشرة (0.1 Pi)</p>
        <button id="payBtn" class="btn">دفع 0.1 Pi الآن</button>
        <p id="msg"></p>
    </div>

    <script>
        const Pi = window.Pi;
        Pi.init({ version: "2.0", sandbox: false });

        // التوثيق وطلب صلاحية الدفع (لحل مشكلة Scope)
        async function authenticate() {
            try {
                await Pi.authenticate(['payments'], (payment) => {
                    console.log("Incomplete payment found", payment);
                });
                console.log("Authenticated with payments scope");
            } catch (err) {
                document.getElementById('msg').innerText = "خطأ في التوثيق: " + err.message;
            }
        }

        // تنفيذ التوثيق فور تحميل الصفحة
        authenticate();

        document.getElementById('payBtn').onclick = async () => {
            const msg = document.getElementById('msg');
            msg.innerText = "جاري فتح المحفظة...";
            try {
                const payment = await Pi.createPayment({
                    amount: 0.1,
                    memo: "Mainnet Checklist Step 10",
                    metadata: { orderId: "step-10-verify" },
                }, {
                    onReadyForServerApproval: (id) => fetch("/approve?id=" + id, { method: "POST" }),
                    onReadyForServerCompletion: (id, txid) => { msg.style.color="green"; msg.innerText = "تم الدفع بنجاح!"; },
                    onCancel: (id) => { msg.innerText = "تم إلغاء العملية"; },
                    onError: (e) => { msg.innerText = "خطأ: " + e.message; }
                });
            } catch (err) {
                msg.innerText = "يرجى استخدام Pi Browser";
            }
        };
    </script>
</body>
</html>
`;

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // مسار السيرفر للموافقة على الدفع
        if (url.pathname === "/approve") {
            const paymentId = url.searchParams.get("id");
            const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
                method: "POST",
                headers: { "Authorization": "Key " + env.PI_API_KEY }
            });
            const result = await response.json();
            return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
        }

        // مسار عرض الصفحة
        return new Response(html, {
            headers: { "Content-Type": "text/html; charset=utf-8" }
        });
    }
};
