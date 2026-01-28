import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

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

  try {
    // 1. التأكد من وجود المفتاح
    if (!API_KEY) throw new Error("المفتاح غير موجود في إعدادات Vercel");

    // 2. استخدام الموديل السريع والمجاني (فلاش)
    const MODEL_NAME = "gemini-1.5-flash";

    const promptText = `Act as an expert Egyptian teacher. Create a detailed lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Output strictly VALID JSON. Language: Arabic.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // هنا السر: سنعرض رسالة الخطأ القادمة من جوجل كما هي
        throw new Error(`Google Error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return sanitize(JSON.parse(cleanText));

  } catch (error: any) {
    console.error("Final Error:", error);
    // 🔴 سنعرض الخطأ لكِ على الشاشة
    return sanitize({
      objectives: [
        "🔴 الخطأ الحقيقي هو:",
        error.message, 
        "صوري هذه الشاشة وأرسليها فوراً"
      ]
    });
  }
};
