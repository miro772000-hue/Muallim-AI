import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  // 1. التأكد من المفتاح
  if (!API_KEY || API_KEY.length < 10) {
    alert("تنبيه: مفتاح API غير موجود في Vercel.");
    throw new Error("Missing API Key");
  }

  // 2. دالة "المصفاة" (Sanitizer) - دي أهم حتة بتمنع الشاشة البيضاء
  // وظيفتها: التأكد إن كل حقل موجود، ولو مش موجود تحط مكانه كلام فاضي عشان الموقع مايقعش
  const sanitizeData = (data: any): LessonPlan => {
    return {
      title: data?.title || topic || "عنوان الدرس",
      gradeLevel: data?.gradeLevel || grade || "",
      estimatedTime: data?.estimatedTime || "45 دقيقة",
      // هنا بنتأكد إن الأهداف لازم تكون قائمة (Array)
      objectives: Array.isArray(data?.objectives) ? data.objectives : ["جاري صياغة الأهداف..."],
      hook: data?.hook || "نشاط تمهيدي",
      // وهنا بنتأكد إن المحتوى قائمة
      contentElements: Array.isArray(data?.contentElements) 
        ? data.contentElements 
        : [{ title: "محتوى الدرس", details: "تفاصيل الدرس..." }],
      differentiation: {
        gifted: data?.differentiation?.gifted || "نشاط إضافي",
        support: data?.differentiation?.support || "نشاط داعم"
      },
      assessment: {
        formative: data?.assessment?.formative || "أسئلة شفوية",
        summative: data?.assessment?.summative || "واجب منزلي"
      }
    };
  };

  try {
    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    // 3. الأمر (Prompt) - طلب التفاصيل بقوة
    const promptText = `Act as an expert Egyptian teacher. Create a DETAILED lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}.
    Content: ${contentStr}.
    
    INSTRUCTIONS:
    - Respond with VALID JSON ONLY.
    - Be COMPREHENSIVE and DETAILED in Arabic.
    - Ensure all fields are filled.
    
    Structure:
    {
      "title": "Lesson Title",
      "gradeLevel": "Grade",
      "estimatedTime": "Time",
      "objectives": ["Detailed Objective 1", "Detailed Objective 2"],
      "hook": "Starter activity",
      "contentElements": [{"title": "Concept", "details": "Deep explanation"}],
      "differentiation": {"gifted": "Task", "support": "Task"},
      "assessment": {"formative": "Q&A", "summative": "Homework"}
    }`;

    // 4. الاتصال بجوجل
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
      })
    });

    if (!response.ok) throw new Error("Google API Error");

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("No text returned.");

    // 5. محاولة قراءة الـ JSON وتنظيفه
    try {
        let cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const firstBrace = cleanText.indexOf('{');
        const lastBrace = cleanText.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1) {
            cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }
        
        const parsed = JSON.parse(cleanText);
        // بنعدي البيانات على المصفاة قبل ما نرجعها
        return sanitizeData(parsed);

    } catch (parseError) {
        console.error("JSON Error:", parseError);
        // لو الرد بايظ خالص، بنرجع خطة طوارئ (بدل الشاشة البيضاء)
        return sanitizeData({
            title: topic,
            objectives: ["حدث خطأ في تنسيق الملف، لكن المحتوى الخام هو:", rawText.substring(0, 100) + "..."],
            contentElements: [{ title: "تنبيه", details: "يرجى المحاولة مرة أخرى للحصول على تنسيق أفضل." }]
        });
    }

  } catch (error) {
    console.error("Network Error:", error);
    alert("حدث خطأ في الشبكة.");
    // حتى في أسوأ الظروف، بنرجع كائن عشان الصفحة ماتقعش
    return sanitizeData({});
  }
};
