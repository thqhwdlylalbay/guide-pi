// اسم الملف: index.js
// المكان: يوضع في GitHub وفي خانة Edit Code في Cloudflare

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
        .btn { background-color: #673ab7; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 18px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>بوابة دفع ثقة ودليل الباي</h1>
    <button class="btn" onclick="transferPi()">دفع 0.1 Pi</button>
    <div id="status"></div>

    <script>
        const Pi = window.Pi;
        Pi.init({ version: "2.0", sandbox: false });

        async function transferPi() {
            try {
                const payment = await Pi.createPayment({
                    amount: 0.1,
                    memo: "دفع رسوم التوثيق - مشروع ثقة",
                    metadata: { type: "test" },
                }, {
                    onReadyForServerApproval: (paymentId) => {
                        fetch("/approve", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ paymentId })
                        });
                    },
                    onReadyForServerCompletion: (paymentId, txid) => {
                        document.getElementById('status').innerText = "تم الدفع بنجاح!";
                    },
                    onCancel: (paymentId) => console.log("Cancelled"),
                    onError: (error) => console.error(error),
                });
            } catch (err) {
                document.getElementById('status').innerText = "خطأ: " + err.message;
            }
        }
    </script>
</body>
</html>
`;

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // مسار الربط مع باي (السيرفر)
        if (url.pathname === "/approve") {
            try {
                const { paymentId } = await request.json();
                const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
                    method: "POST",
                    headers: { "Authorization": "Key " + env.PI_API_KEY }
                });
                const result = await response.json();
                return new Response(JSON.stringify(result), { headers: { "Content-Type": "application/json" } });
            } catch (e) {
                return new Response(JSON.stringify({error: e.message}), { status: 500 });
            }
        }

        // مسار عرض الصفحة (الواجهة)
        return new Response(html, {
            headers: { "Content-Type": "text/html; charset=utf-8" }
        });
    }
};
