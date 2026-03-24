const Pi = window.Pi;
Pi.init({ version: "2.0", sandbox: true });

const payButton = document.getElementById('pay-button');
const statusDiv = document.getElementById('status');

payButton.addEventListener('click', async () => {
    statusDiv.innerText = "جاري فتح المحفظة...";
    payButton.disabled = true;

    try {
        const payment = await Pi.createPayment({
            amount: 0.1,
            memo: "تفعيل الخطوة 10 - مشروع ثقة",
            metadata: { orderId: "step-10-activation" },
        }, {
            onReadyForServerApproval: async (paymentId) => {
                statusDiv.innerText = "جاري تأكيد العملية من نظام Pi...";
                // ملاحظة: الخطوة 10 أحياناً تكتمل تلقائياً في Sandbox إذا كان التطبيق مسجلاً بشكل صحيح
                console.log("Payment ID for approval:", paymentId);
            },
            onReadyForServerCompletion: (paymentId, txid) => {
                statusDiv.innerText = "مبروك! تمت العملية بنجاح. \n رقم المعاملة: " + txid;
                console.log("Success! TXID:", txid);
            },
            onCancel: (paymentId) => {
                statusDiv.innerText = "تم إلغاء العملية.";
                payButton.disabled = false;
            },
            onError: (error, payment) => {
                statusDiv.innerText = "حدث خطأ: " + error.message;
                payButton.disabled = false;
            }
        });
    } catch (err) {
        statusDiv.innerText = "فشل بدء الدفع، تأكدي من فتح الرابط داخل Pi Browser.";
        payButton.disabled = false;
    }
});
