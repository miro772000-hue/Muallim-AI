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
      differentiation: { 
        gifted: data?.differentiation?.gifted || "أنشطة إثرائية", 
        support: data?.differentiation?.support || "أنشطة علاجية" 
      },
      assessment: { 
        formative: data?.assessment?.formative || "تقويم تكويني", 
        summative: data?.assessment?.summative || "تقويم ختامي" 
      }
    };
  };

  try {
    if (!API_KEY) throw new Error("المفتاح غير موجود");

    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    const promptText = `Act as an expert Egyptian teacher. Create a detailed lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}.
    Content: ${contentStr}.
    Output strictly VALID JSON. Language: Arabic.`;

    // 👇 هنا التغيير السحري: استخدمنا gemini-pro بدلاً من flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Error ${response.status}: ${errorData.error?.message}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    // تنظيف النص من علامات الكود لضمان عدم حدوث خطأ
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return sanitize(JSON.parse(cleanText));

  } catch (error: any) {
    console.error("Error:", error);
    return sanitize({
      objectives: [
        "حدث خطأ تقني بسيط:",
        error.message
      ]
    });
  }
};
