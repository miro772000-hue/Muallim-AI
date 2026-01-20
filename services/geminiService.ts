import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  // 🟢 1. قارب النجاة: خطة احتياطية كاملة تمنع الشاشة البيضاء
  // هذه الخطة ستظهر فوراً لو حصل أي خطأ في النظام
  const LIFE_RAFT: LessonPlan = {
    title: topic || "عنوان الدرس (خطة طوارئ)",
    gradeLevel: grade || "الصف",
    estimatedTime: "45 دقيقة",
    objectives: [
        "لم نتمكن من توليد الأهداف بسبب خطأ في الاتصال.",
        "يرجى التأكد من مفتاح API واتصال الإنترنت.",
        "هذه بيانات مؤقتة لمنع توقف التطبيق."
    ],
    hook: "نشاط تمهيدي افتراضي (بسبب تعذر الاتصال).",
    contentElements: [
        { title: "تنبيه هام", details: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي. التطبيق يعمل في وضع الطوارئ الآن." }
    ],
    differentiation: { 
        gifted: "نشاط إثرائي مقترح", 
        support: "نشاط علاجي مقترح" 
    },
    assessment: { 
        formative: "سؤال شفهي", 
        summative: "واجب منزلي" 
    }
  };

  // 🟢 2. الحماية الشاملة (Try-Catch)
  try {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    // إذا لم يوجد مفتاح، نرجع قارب النجاة فوراً
    if (!API_KEY || typeof API_KEY !== 'string') {
        console.error("API Key missing");
        return LIFE_RAFT;
    }

    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    // الأمر
    const promptText = `Create a lesson plan for: "${topic}". Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}. Content: ${contentStr}.
    Output JSON only. Arabic language.
    Required fields: title, gradeLevel, estimatedTime, objectives (array), hook, contentElements (array of title/details), differentiation (gifted/support), assessment (formative/summative).`;

    // الاتصال
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    if (!response.ok) throw new Error("Google API Error");

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("No text");

    // تنظيف وتحويل
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    // التأكد من أن البيانات القادمة سليمة، وإلا نستخدم قارب النجاة
    return {
        title: parsed.title || LIFE_RAFT.title,
        gradeLevel: parsed.gradeLevel || LIFE_RAFT.gradeLevel,
        estimatedTime: parsed.estimatedTime || LIFE_RAFT.estimatedTime,
        objectives: Array.isArray(parsed.objectives) ? parsed.objectives : LIFE_RAFT.objectives,
        hook: parsed.hook || LIFE_RAFT.hook,
        contentElements: Array.isArray(parsed.contentElements) ? parsed.contentElements : LIFE_RAFT.contentElements,
        differentiation: parsed.differentiation || LIFE_RAFT.differentiation,
        assessment: parsed.assessment || LIFE_RAFT.assessment
    };

  } catch (error) {
    // 🛑 في حالة أي خطأ (شبكة، كود، مفتاح)، نرجع قارب النجاة بدلاً من الشاشة البيضاء
    console.error("CRITICAL ERROR (Serving Life Raft):", error);
    return LIFE_RAFT;
  }
};
