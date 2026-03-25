// 1. تعريف الصلاحيات والدوال المطلوبة
const scopes = ['payments'];

function onIncompletePaymentFound(payment) { 
    /* ... */ 
};

// 2. عملية المصادقة (Authentication)
Pi.authenticate(scopes, onIncompletePaymentFound).then(function(auth) {
  console.log("Hi there! You're ready to make payments!");
}).catch(function(error) {
  console.error(error);
});

// 3. كود إنشاء عملية الدفع (Create Payment)
// ملحوظة: الكورتيم ينصح بوضع هذا الكود داخل "حدث" مثل ضغطة زرار
Pi.createPayment({
  amount: 3.14,
  memo: "...", 
  metadata: { /* ... */ }, 
}, {
  onReadyForServerApproval: function(paymentId) { /* ... */ },
  onReadyForServerCompletion: function(paymentId, txid) { /* ... */ },
  onCancel: function(paymentId) { /* ... */ },
  onError: function(error, payment) { /* ... */ },
});
