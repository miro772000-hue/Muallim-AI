import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  const sanitize = (data: any): LessonPlan => {
    return {
      title: data?.title || topic || "عنوان الدرس",
      gradeLevel: data?.gradeLevel || grade || "غير محدد",
      estimatedTime: data?.estimatedTime || "45 دقيقة",
      objectives: Array.isArray(data?.objectives) ? data.objectives : ["لا توجد أهداف"],
      hook: data?.hook || "نشاط تمهيدي",
      contentElements: Array.isArray(data?.contentElements) ? data.contentElements : [],
      differentiation: { gifted: "-", support: "-" },
      assessment: { formative: "-", summative: "-" }
    };
  };

  try {
    // 1. فحص وجود المفتاح وشكله
    if (!API_KEY) throw new Error("المفتاح غير موجود (Empty Key)");
    if (API_KEY.startsWith('"') || API_KEY.endsWith('"')) throw new Error("المفتاح يحتوي على علامات تنصيص زائدة في Vercel");
    if (API_KEY.includes("PASTE")) throw new Error("المفتاح لم يتم تغييره في الكود");

    const promptText = `Act as an expert Egyptian teacher. Create a detailed lesson plan for: "${topic}". Subject: ${subject}. Grade: ${grade}. Output strictly VALID JSON. Language: Arabic.`;

    // 2. محاولة الاتصال مع طباعة الخطأ الصريح
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // هذا السطر سيفضح سبب الرفض من جوجل
        throw new Error(`Google Error ${response.status}: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const cleanText = data.candidates?.[0]?.content?.parts?.[0]?.text.replace(/```json/g, '').replace(/```/g, '').trim();
    return sanitize(JSON.parse(cleanText));

  } catch (error: any) {
    console.error("Full Error:", error);
    // 🔴 هنا التغيير: سنعرض تفاصيل الخطأ لكِ في الشاشة
    return sanitize({
      objectives: [
        "🔴 تم كشف الخطأ:",
        `الرسالة: ${error.message}`,
        "صور الشاشة وارسلها للمساعد فوراً."
      ]
    });
  }
};
