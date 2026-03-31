
export async function onRequestPost(context) {
    const { paymentId } = await context.request.json();
    
    // هنا يتم استدعاء API الخاص بـ Pi لتأكيد العملية
    // ملاحظة: ستحتاجين لوضع API KEY الخاص بكِ في إعدادات Cloudflare
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: {
            'Authorization': `Key ${context.env.PI_API_KEY}`
        }
    });

    const result = await response.json();
    return new Response(JSON.stringify(result));
}
