export async function onRequestPost(context) {
    const { request, env } = context;
    
    // 1. التحقق من وجود مفتاح الـ API
    const PI_API_KEY = env.PI_API_KEY;
    if (!PI_API_KEY) {
        return new Response(JSON.stringify({ error: "Missing PI_API_KEY in environment variables" }), { status: 500 });
    }

    try {
        const body = await request.json();
        const { paymentId, txid, action } = body;
        const baseUrl = "https://api.minepi.com/v2/payments/";

        // 2. تجهيز الإعدادات بناءً على نوع الأكشن
        let url = `${baseUrl}${paymentId}/`;
        let fetchOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Key ${PI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        if (action === 'approve') {
            url += 'approve';
            // في حالة approve، البروتوكول يفضل عدم إرسال body نهائياً
        } else if (action === 'complete') {
            url += 'complete';
            if (!txid) throw new Error("Missing txid for completion");
            fetchOptions.body = JSON.stringify({ txid: txid });
        } else {
            return new Response(JSON.stringify({ error: "Invalid Action" }), { status: 400 });
        }

        // 3. تنفيذ الطلب إلى سيرفرات Pi
        const response = await fetch(url, fetchOptions);
        
        // التحقق من استجابة سيرفر Pi
        if (!response.ok) {
            const errorData = await response.text();
            console.error("Pi API Error:", errorData);
            return new Response(errorData, { status: response.status });
        }

        const result = await response.json();
        return new Response(JSON.stringify(result), {
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // للسماح بالطلب من المتصفح دون مشاكل CORS
            }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
                                }
