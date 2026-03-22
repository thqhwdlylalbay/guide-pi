// مصفوفة تجريبية للتجار (ممكن نحدثها لملف JSON لاحقاً)
const merchants = [
    { name: "متجر الأمل", category: "إلكترونيات", status: "موثوق" },
    { name: "خدمات التقنية", category: "برمجيات", status: "موثوق" }
];

function displayMerchants() {
    const container = document.getElementById('merchants-container');
    container.innerHTML = ''; // مسح رسالة التحميل

    merchants.forEach(m => {
        const card = document.createElement('div');
        card.className = 'merchant-card';
        card.innerHTML = `
            <h3>${m.name}</h3>
            <p>التخصص: ${m.category}</p>
            <span style="color: green; font-weight: bold;">✔️ ${m.status}</span>
        `;
        container.appendChild(card);
    });
}

// تشغيل الدالة عند تحميل الصفحة
window.onload = displayMerchants;
