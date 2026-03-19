const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Trust and Pi Guide</title><script src="https://sdk.minepi.com/pi-sdk.js"></script><style>body { font-family: sans-serif; text-align: center; padding: 50px; background: #f4f4f9; } .card { background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); display: inline-block; } .btn { background-color: #673ab7; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 18px; cursor: pointer; font-weight: bold; } .btn:disabled { background-color: #ccc; }</style></head><body><div class="card"><h2>تحديث بوابة الدفع</h2><p>مبلغ الفحص: 0.1 Pi</p><button id="p-btn" class="btn" disabled>انتظار التحديث...</button><p id="s"></p></div><script>const Pi = window.Pi; async function init() { try { await Pi.init({ version: "2.0", sandbox: true }); await Pi.authenticate(['payments'], (p) => {}); document.getElementById('p-btn').disabled = false; document.getElementById('p-btn').innerText = 'دفع 0.1 Pi ⚡'; } catch (e) { document.getElementById('s').innerText = '⚠️ افتحي من Pi Browser'; } } init(); document.getElementById('p-btn').onclick = async () => { try { await Pi.createPayment({ amount: 0.1, memo: "Refresh Connection", metadata: { id: "ref_" + Date.now() } }, { onReadyForServerApproval: (id) => fetch("/approve?id=" + id, { method: "POST" }), onReadyForServerCompletion: (id, txid) => alert("تم فك التعليقة بنجاح!"), onCancel: (id) => {}, onError: (e) => alert("الرسالة: " + e.message) }); } catch (err) { alert(err.message); } };</script></body></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/approve" && request.method === "POST") {
      const paymentId = url.searchParams.get("id");
      const res = await fetch("https://api.minepi.com/v2/payments/" + paymentId + "/approve", {
        method: "POST",
        headers: {
          "Authorization": "Key " + env.PI_API_KEY,
          "Content-Type": "application/json"
        }
      });
      return new Response(await res.text(), { status: 200 });
    }
    return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
  }
};
