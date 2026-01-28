import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  // 🔴 هام جداً: امسحي كلمة (AIzaSyBZHmYRnBTds-dNT9oY0bVfHwlXNrgeRgk) والصقي مفتاحك الجديد الطويل مكانها بين علامتي التنصيص
  const API_KEY = "ضع_مفتاحك_الجديد_هنا_بدلا_من_هذه_الجملة";

  // دالة الحماية
  const sanitize = (data: any): LessonPlan => {
    return {
      title: data?.title || topic || "عنوان الدرس",
      gradeLevel: data?.gradeLevel || grade || "غير محدد",
      estimatedTime: data?.estimatedTime || "45 دقيقة",
      objectives: Array.isArray(data?.objectives) ? data.objectives : ["جاري التحميل..."],
      hook: data?.hook || "نشاط تمهيدي",
      contentElements: Array.isArray(data?.contentElements) ? data.contentElements : [],
      differentiation: { gifted: "-", support: "-" },
      assessment: { formative: "-", summative: "-" }
    };
  };

  const tryModel = async (modelName: string, prompt: string): Promise<any> => {
    // طباعة للمساعدة في كشف الخطأ
    console.log(`Connecting with key: ${API_KEY.substring(0, 10)}... to model ${modelName}`);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
        const err = await response.json();
        console.error(`Model ${modelName} Error:`, err);
        throw new Error(`Model ${modelName} failed: ${err.error?.message || response.statusText}`);
    }
    return response.json();
  };

  try {
    if (!API_KEY || API_KEY.includes("ضع_مفتاحك")) {
        alert("تنبيه: نسيتي وضع المفتاح مكان الجملة العربية في الكود!");
        return sanitize({});
    }

    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    const promptText = `Act as an expert Egyptian teacher. Create a detailed lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}.
    Content: ${contentStr}.
    Output strictly VALID JSON. Language: Arabic.`;

    // تجربة الموديلات بالترتيب
    const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
    let rawText = "";

    for (const model of modelsToTry) {
      try {
        const data = await tryModel(model, promptText);
        rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) break;
      } catch (e) {
        continue;
      }
    }

    if (!rawText) throw new Error("فشل الاتصال بكل الموديلات (Flash & Pro).");

    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return sanitize(JSON.parse(cleanText));

  } catch (error: any) {
    alert(`الخطأ النهائي: ${error.message}\nتأكدي أن المفتاح منسوخ بشكل صحيح.`);
    return sanitize({
      objectives: ["حدث خطأ أثناء الاتصال.", error.message]
    });
  }
};
