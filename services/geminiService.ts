import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  const sanitize = (data: any): LessonPlan => {
    return {
      title: "فحص الموديلات",
      gradeLevel: "تشخيص",
      estimatedTime: "0 دقيقة",
      objectives: data?.objectives || ["جاري الفحص..."],
      hook: "نتائج الفحص بالأسفل",
      contentElements: [],
      differentiation: { gifted: "-", support: "-" },
      assessment: { formative: "-", summative: "-" }
    };
  };

  try {
    // هذا الرابط يسأل جوجل: ما هي الموديلات المتاحة لي؟
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`فشل جلب القائمة: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // هنا سنلتقط أسماء الموديلات ونعرضها لك
    const availableModels = data.models
        .map((m: any) => m.name) // نأخذ الاسم فقط
        .filter((name: string) => name.includes("gemini")); // نركز على موديلات جيمناي

    return sanitize({
      objectives: [
        "✅ الموديلات المتاحة لمفتاحك هي:",
        ...availableModels.slice(0, 5), // نعرض أول 5 موديلات
        "----------------",
        "صوري هذه الشاشة وأرسليها لي!"
      ]
    });

  } catch (error: any) {
    return sanitize({
      objectives: [
        "🔴 خطأ خطير:",
        error.message,
        "تأكدي أنك مفعلة Generative Language API في جوجل"
      ]
    });
  }
};
