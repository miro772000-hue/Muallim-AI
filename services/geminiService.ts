import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  // 1. تعريف خطة الطوارئ (تظهر في حالة حدوث أي خطأ لمنع الشاشة البيضاء)
  const safeFallback: LessonPlan = {
    title: topic || "عنوان الدرس",
    gradeLevel: grade || "الصف الدراسي",
    estimatedTime: "45 دقيقة",
    objectives: ["حدث خطأ في الاتصال، ولكن تم الحفاظ على عمل التطبيق.", "يرجى المحاولة مرة أخرى لاحقاً."],
    hook: "نشاط تمهيدي بسيط.",
    contentElements: [
        { title: "تنبيه", details: "لم نتمكن من جلب المحتوى من الذكاء الاصطناعي بسبب ضعف الشبكة أو خطأ في المفتاح." }
    ],
    differentiation: { gifted: "-", support: "-" },
    assessment: { formative: "-", summative: "-" }
  };

  try {
    // 2. محاولة جلب المفتاح بأمان تام
    let API_KEY = "";
    try {
        // @ts-ignore
        API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    } catch (e) {
        console.error("Error reading env:", e);
    }

    // إذا لم نجد المفتاح، نرجع خطة الطوارئ بدلاً من انهيار التطبيق
    if (!API_KEY || typeof API_KEY !== 'string') {
        console.warn("No API Key found");
        return { ...safeFallback, objectives: ["عذراً، مفتاح API مفقود في إعدادات Vercel."] };
    }

    // 3. تجهيز البيانات
    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    // 4. الأمر (Prompt) - قللنا الحجم قليلاً لتجنب انقطاع الشبكة (Timeout)
    const promptText = `Act as an expert Egyptian teacher. Create a lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}.
    Content: ${contentStr}.
    
    Format: VALID JSON ONLY. No Markdown.
    Structure:
    {
      "title": "Lesson Title",
      "gradeLevel": "Grade",
      "estimatedTime": "Time",
      "objectives": ["Obj1", "Obj2", "Obj3"],
      "hook": "Activity",
      "contentElements": [{"title": "Concept", "details": "Explanation"}],
      "differentiation": {"gifted": "Task", "support": "Task"},
      "assessment": {"formative": "Q", "summative": "Q"}
    }
    Language: Arabic.`;

    // 5. الاتصال بجوجل (مع مهلة زمنية لتجنب التعليق)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // إيقاف المحاولة بعد 15 ثانية

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(`Google Error: ${response.status}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("No text returned");

    // 6. تنظيف النص وتحويله
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanText);

    // التأكد من أن النتيجة تحتوي على الحد الأدنى من البيانات
    return {
        title: parsedData.title || topic,
        gradeLevel: parsedData.gradeLevel || grade,
        estimatedTime: parsedData.estimatedTime || "45 دقيقة",
        objectives: Array.isArray(parsedData.objectives) ? parsedData.objectives : ["هدف 1", "هدف 2"],
        hook: parsedData.hook || "نشاط",
        contentElements: Array.isArray(parsedData.contentElements) ? parsedData.contentElements : [],
        differentiation: parsedData.differentiation || { gifted: "", support: "" },
        assessment: parsedData.assessment || { formative: "", summative: "" }
    };

  } catch (error) {
    console.error("CRITICAL ERROR:", error);
    // 🛑 هذا هو السطر الذي يمنع الشاشة البيضاء
    // مهما كان الخطأ (شبكة، مفتاح، كود)، سنرجع خطة الطوارئ
    return safeFallback;
  }
};
