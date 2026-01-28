import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  // دالة الحماية (عشان الموقع ما يوقفش لو حصل أي ظرف)
  const sanitize = (data: any): LessonPlan => {
    return {
      title: data?.title || topic || "عنوان الدرس",
      gradeLevel: data?.gradeLevel || grade || "غير محدد",
      estimatedTime: data?.estimatedTime || "45 دقيقة",
      objectives: Array.isArray(data?.objectives) ? data.objectives : ["جاري توليد الأهداف..."],
      hook: data?.hook || "نشاط تمهيدي مقترح",
      contentElements: Array.isArray(data?.contentElements) ? data.contentElements : [],
      differentiation: { 
        gifted: data?.differentiation?.gifted || "أنشطة إثرائية", 
        support: data?.differentiation?.support || "أنشطة علاجية" 
      },
      assessment: { 
        formative: data?.assessment?.formative || "أسئلة شفوية", 
        summative: data?.assessment?.summative || "واجب منزلي" 
      }
    };
  };

  try {
    if (!API_KEY) throw new Error("المفتاح غير موجود");

    // 👇 هنا الحل: ثبتنا الاسم على الموديل السريع والمجاني اللي ظهر في قائمتك
    // gemini-1.5-flash هو الأفضل للحسابات المجانية
    const MODEL_NAME = "gemini-1.5-flash";

    const promptText = `Act as an expert Egyptian teacher. Create a detailed lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategies || "Interactive"}.
    Content: ${contentElements || "Core concepts"}.
    
    Output strictly VALID JSON with this structure:
    {
      "title": "...",
      "gradeLevel": "...",
      "estimatedTime": "...",
      "objectives": ["...", "..."],
      "hook": "...",
      "contentElements": [{"title": "...", "details": "..."}],
      "differentiation": {"gifted": "...", "support": "..."},
      "assessment": {"formative": "...", "summative": "..."}
    }
    Language: Arabic.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });

    if (!response.ok) {
        const errorData = await response.json();
        // لو فلاش فشل، نجرب القديم كاحتياطي أخير
        if (response.status === 404 || response.status === 429) {
            console.log("Retrying with gemini-pro...");
            const retry = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
            });
            if (retry.ok) {
                const retryData = await retry.json();
                const retryText = retryData.candidates?.[0]?.content?.parts?.[0]?.text;
                return sanitize(JSON.parse(retryText.replace(/```json/g, '').replace(/```/g, '').trim()));
            }
        }
        throw new Error(`Google Error: ${errorData.error?.message}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return sanitize(JSON.parse(cleanText));

  } catch (error: any) {
    console.error("Final Error:", error);
    return sanitize({
      objectives: [
        "حدث خطأ مؤقت في الخدمة.",
        "يرجى الانتظار دقيقة والمحاولة مرة أخرى."
      ]
    });
  }
};
