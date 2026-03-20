const validationKey = "pi-site-verification: 3562fc6b6931e1cd41c68c41949a0ec339d9cecfdcfa4b7ea0c73ce38fd1f058b217b7dca4f706885139f2c5ff8a94a0a686f57ace7f071a73ae9f48d0589f4e"; 
const MY_OLD_TXID = "7aadb13583c9982f7650e8619153f87775a80768116fcf2c2f8451ef8dfbcf17";
// تأكدي من وضع مفتاحك السري هنا
const SECRET_KEY = "3a0opkidwbyqjyqkdzs0xljoux0xfqgsizvowwdtmck6bfur8tihttb9jtcf3iwr"; 

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/.well-known/pi-common-configuration.txt") {
      return new Response(validationKey, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }

    if (request.method === "POST" && url.pathname === "/complete") {
      try {
        const paymentId = url.searchParams.get("id");
        const res = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
          method: "POST",
          headers: { 
            "Authorization": "Key " + SECRET_KEY, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ txid: MY_OLD_TXID })
        });
        const data = await res.text();
        return new Response(data, { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
      }
    }

    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://sdk.minepi.com/pi-sdk.js"></script>
    <title>إصلاح مع انتظار القراءة</title>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 20px; background: #f4f4f9; }
        .card { max-width: 450px; margin: auto; background: white; padding: 30px; border-radius: 25px; box-shadow: 0 15px 35px rgba(0,0,0,0.15); }
        .btn { padding: 20px; background: #e91e63; color: white; border: none; border-radius: 15px; width: 100%; cursor: pointer; font-size: 18px; font-weight: bold; }
        #status { margin-top: 25px; padding: 20px; border-radius: 15px; background: #fff3e0; border: 2px solid #ffe0b2; color: #e65100; font-weight: bold; font-size: 16px; line-height: 1.6; display: none; }
        .loading-dots:after { content: ' .'; animation: dots 1s steps(5, end) infinite; }
        @keyframes dots { 0%, 20% { color: rgba(0,0,0,0); text-shadow: .5em 0 0 rgba(0,0,0,0), 1em 0 0 rgba(0,0,0,0); } 40% { color: #e65100; text-shadow: .5em 0 0 rgba(0,0,0,0), 1em 0 0 rgba(0,0,0,0); } 60% { text-shadow: .5em 0 0 #e65100, 1em 0 0 rgba(0,0,0,0); } 80%, 100% { text-shadow: .5em 0 0 #e65100, 1em 0 0 #e65100; } }
    </style>
</head>
<body>
    <div class="card">
        <h2>أداة فك التعليق الذكية</h2>
        <p>سيتم إيقاف الشاشة عند كل خطوة لتتمكني من القراءة.</p>
        <button id="btn" class="btn" onclick="startFix()">ابدأ عملية الإصلاح</button>
        <div id="status"></div>
    </div>

    <script>
        Pi.init({ version: "2.0", sandbox: false });
        
        // وظيفة للانتظار
        const wait = ms => new Response(resolve => setTimeout(resolve, ms));

        async function startFix() {
            const btn = document.getElementById('btn');
            const status = document.getElementById('status');
            btn.disabled = true;
            status.style.display = "block";

            try {
                status.innerHTML = "جاري الاتصال بـ Pi Network<span class='loading-dots'></span>";
                
                await Pi.authenticate(['payments'], async (payment) => {
                    // هنا التعديل: سننتظر 4 ثواني لتقرأي البيانات
                    status.innerHTML = "✅ تم العثور على المعاملة!<br>ID: <small>" + payment.identifier + "</small><br><br><b>انتظري 4 ثواني للقراءة...</b>";
                    await new Promise(r => setTimeout(r, 4000));

                    status.innerHTML = "جاري إرسال طلب الإنهاء للسيرفر الآن<span class='loading-dots'></span>";
                    
                    const response = await fetch('/complete?id=' + payment.identifier, { method: 'POST' });
                    const result = await response.text();
                    
                    await new Promise(r => setTimeout(r, 2000));
                    status.innerHTML = "<b>رد السيرفر النهائي:</b><br>" + result;
                    
                    if(result.includes("success") || result.includes("already")) {
                        status.style.background = "#e8f5e9";
                        status.style.borderColor = "#c8e6c9";
                        status.style.color = "#2e7d32";
                    }
                });
            } catch (e) {
                status.innerHTML = "❌ حدث خطأ: " + e.message;
                btn.disabled = false;
            }
        }
    </script>
</body>
</html>`;

    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
