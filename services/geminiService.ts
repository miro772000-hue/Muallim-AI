import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  // دالة الحماية (لمنع الشاشة البيضاء)
  const sanitize = (data: any, errorMsg?: string): LessonPlan => {
    return {
      title: data?.title || topic || "عنوان الدرس",
      gradeLevel: data?.gradeLevel || grade || "الصف",
      estimatedTime: data?.estimatedTime || "45 دقيقة",
      objectives: Array.isArray(data?.objectives) ? data.objectives : [
        errorMsg || "عذراً، حدث خطأ أثناء الاتصال.",
        "يرجى التأكد من مفتاح API في إعدادات Vercel.",
        "قد يحتاج الموقع إلى (Redeploy) لتفعيل المفتاح الجديد."
      ],
      hook: data?.hook || "يرجى التحقق من الإعدادات.",
      contentElements: Array.isArray(data?.contentElements) ? data.contentElements : [],
      differentiation: {
        gifted: data?.differentiation?.gifted || "-",
        support: data?.differentiation?.support || "-"
      },
      assessment: {
        formative: data?.assessment?.formative || "-",
        summative: data?.assessment?.summative || "-"
      }
    };
  };

  try {
    if (!API_KEY || API_KEY.length < 5) {
        alert("تنبيه: الكود لا يرى مفتاح API. تأكدي من إضافته في Vercel Environment Variables.");
        throw new Error("Missing API Key");
    }

    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    // استخدام الموديل الأسرع والأكثر توافقاً حالياً
    const promptText = `Act as an expert Egyptian teacher. Create a detailed lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}.
    Content: ${contentStr}.
    Output strictly VALID JSON. Language: Arabic.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        const errorMsg = errorData.error?.message || response.statusText;
        // 🛑 هنا السر: إظهار رسالة الخطأ الحقيقية للمستخدم
        alert(`خطأ من جوجل: ${errorMsg}`);
        console.error("Gemini API Error:", errorData);
        throw new Error(errorMsg);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("No text returned");

    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanText);

    return sanitize(parsedData);

  } catch (error: any) {
    console.error("Generation Error:", error);
    // إرجاع الخطة مع رسالة الخطأ المحددة
    return sanitize({}, `السبب: ${error.message}`);
  }
};
