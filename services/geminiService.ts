import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  // دالة التنظيف (للحماية)
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
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!response.ok) throw new Error(`Model ${modelName} failed`);
    return response.json();
  };

  try {
    // 1. كشف أول 5 حروف من المفتاح للتأكد
    const keyStart = API_KEY.length > 5 ? API_KEY.substring(0, 5) + "..." : "غير موجود";
    console.log("Using Key starting with:", keyStart);

    if (!API_KEY || API_KEY.length < 5) {
        alert("تنبيه: الكود لا يرى أي مفتاح (Empty Key).");
        return sanitize({});
    }

    const promptText = `Act as an expert Egyptian teacher. Create a detailed lesson plan for: "${topic}". Subject: ${subject}. Grade: ${grade}. Output strictly VALID JSON. Language: Arabic.`;

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

    if (!rawText) throw new Error("All models failed");

    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return sanitize(JSON.parse(cleanText));

  } catch (error: any) {
    // 🛑 هنا المفاجأة: سنعرض لكِ بداية المفتاح الذي يراه الموقع
    const keyStart = API_KEY.substring(0, 5) + "...";
    
    alert(`الموقع ما زال يستخدم المفتاح الذي يبدأ بـ: ( ${keyStart} )
    
    قارني هذا بالمفتاح الجديد في Google AI Studio.
    - لو مختلفين: يبقى Vercel لسه محتفظ بالقديم (محتاج Redeploy).
    - لو زي بعض: يبقى المفتاح الجديد نفسه فيه مشكلة.`);
    
    return sanitize({
      objectives: ["فشل الاتصال.", `المفتاح المستخدم يبدأ بـ: ${keyStart}`]
    });
  }
};
