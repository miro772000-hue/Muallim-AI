import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  // 1. دالة التنظيف (للحماية من الشاشة البيضاء)
  const sanitize = (data: any): LessonPlan => {
    return {
      title: data?.title || topic || "عنوان الدرس",
      gradeLevel: data?.gradeLevel || grade || "غير محدد",
      estimatedTime: data?.estimatedTime || "45 دقيقة",
      objectives: Array.isArray(data?.objectives) ? data.objectives : ["جاري توليد الأهداف..."],
      hook: data?.hook || "نشاط تمهيدي",
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

  // 2. دالة المحاولة (تجرب موديل معين)
  const tryModel = async (modelName: string, prompt: string): Promise<any> => {
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
    // التأكد من وجود مفتاح
    if (!API_KEY || API_KEY.length < 5) {
        alert("تنبيه: مفتاح API مفقود في إعدادات Vercel.");
        return sanitize({});
    }

    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    const promptText = `Act as an expert Egyptian teacher. Create a detailed lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}.
    Content: ${contentStr}.
    Output strictly VALID JSON. Language: Arabic.`;

    // 3. القائمة الذكية: سنجرب هذه الموديلات بالترتيب
    // لو الأول فشل، يدخل على التاني فوراً
    const modelsToTry = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro"];
    let rawText = "";

    for (const model of modelsToTry) {
      try {
        console.log(`Trying model: ${model}...`);
        const data = await tryModel(model, promptText);
        rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) break; // لو نجحنا، نخرج من الحلقة فوراً
      } catch (e) {
        console.warn(`${model} failed, trying next...`);
        // نكمل اللفة اللي بعدها نجرب الموديل التالي
      }
    }

    if (!rawText) {
       throw new Error("All models failed to respond.");
    }

    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanText);

    return sanitize(parsedData);

  } catch (error: any) {
    console.error("Final Error:", error);
    if (error.message.includes("All models failed")) {
        alert("المفتاح الحالي لا يدعم أي موديل (Flash أو Pro). يرجى التأكد من صلاحية المفتاح.");
    } else {
        alert("حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
    }
    
    return sanitize({
      objectives: ["تعذر الاتصال بالخدمة.", "يرجى المحاولة مرة أخرى."]
    });
  }
};
