import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  // 🔴 الخطوة الوحيدة: امسحي الكلمة الإنجليزية بالأسفل وضعي مفتاحك الطويل مكانها
  const API_KEY = "AIzaSyBZHmYRnBTds-dNT9oY0bVfHwlXNrgeRgk";

  // ---------------------------------------------------------

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
    // طباعة للتأكد من أن المفتاح الجديد تم قراءته
    console.log(`Trying model ${modelName} with key starting: ${API_KEY.substring(0,5)}...`);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
        throw new Error(`Model ${modelName} failed`);
    }
    return response.json();
  };

  try {
    // التحقق من أنك وضعتي المفتاح
    if (API_KEY === "PASTE_YOUR_KEY_HERE" || !API_KEY) {
        alert("تنبيه: لم تضعي المفتاح مكان كلمة PASTE_YOUR_KEY_HERE في الكود.");
        return sanitize({});
    }

    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    const promptText = `Act as an expert Egyptian teacher. Create a detailed lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}.
    Content: ${contentStr}.
    Output strictly VALID JSON. Language: Arabic.`;

    // القائمة الذهبية للموديلات
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

    if (!rawText) throw new Error("فشل الاتصال بجميع الموديلات. تأكدي أن المفتاح مفعل.");

    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return sanitize(JSON.parse(cleanText));

  } catch (error: any) {
    alert(`حدث خطأ: ${error.message}`);
    return sanitize({
      objectives: ["حدث خطأ أثناء الاتصال.", "يرجى مراجعة المفتاح."]
    });
  }
};
