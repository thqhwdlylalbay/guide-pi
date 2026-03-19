const html = "<!DOCTYPE html><html lang='ar' dir='rtl'><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Trust and Pi Guide</title><script src='https://sdk.minepi.com/pi-sdk.js'></script><style>body { font-family: sans-serif; text-align: center; padding: 40px; background: #f4f4f9; } .card { background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: inline-block; } .btn { background-color: #673ab7; color: white; padding: 15px 35px; border: none; border-radius: 10px; font-size: 20px; cursor: pointer; font-weight: bold; } .btn:disabled { background-color: #ccc; }</style></head><body><div class='card'><h2>بوابة دفع Pi</h2><p>المبلغ: 0.5 Pi</p><button id='pay-btn' class='btn' disabled>انتظار...</button><div id='msg' style='margin-top:15px;'>جاري التحميل...</div></div><script>const Pi = window.Pi; async function init() { try { await Pi.init({ version: '2.0', sandbox: true }); await Pi.authenticate(['payments'], (p) => {}); document.getElementById('pay-btn').disabled = false; document.getElementById('pay-btn').innerText = 'دفع الآن'; document.getElementById('msg').innerText = '✅ جاهز'; } catch (e) { document.getElementById('msg').innerText = '⚠️ افتحي من Pi Browser'; } } init(); document.getElementById('pay-btn').onclick = async () => { try { await Pi.createPayment({ amount: 0.5, memo: 'Test Order', metadata: { order_id: 'id_' + Date.now() } }, { onReadyForServerApproval: (id) => fetch('/approve?id=' + id, { method: 'POST' }), onReadyForServerCompletion: (id, txid) => alert('تمت بنجاح!'), onCancel: (id) => alert('تم الإلغاء'), onError: (e) => alert('خطأ: ' + e.message) }); } catch (err) { alert(err.message); } };</script></body></html>";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // الجزء اللي كولد فلير بينفذه للموافقة
    if (url.pathname === "/approve" && request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      
      // هنا استخدمت الجمع التقليدي (+) بدلاً من الرموز المعقدة لضمان القبول
      const api_url = "https://api.minepi.com/v2/payments/" + paymentId + "/approve";
      
      const res = await fetch(api_url, {
        method: "POST",
        headers: {
          "Authorization": "Key " + env.PI_API_KEY,
          "Content-Type": "application/json"
        }
      });
      
      return new Response(await res.text(), { status: 200 });
    }

    // عرض الصفحة
    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  }
};
