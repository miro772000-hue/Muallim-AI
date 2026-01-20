import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  // 1. جلب المفتاح من Vercel
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  // 2. دالة "المصفاة" (Sanitize) - دي اللي بتمنع الشاشة البيضاء لو البيانات ناقصة
  const sanitize = (data: any): LessonPlan => {
    return {
      title: data?.title || topic || "عنوان الدرس",
      gradeLevel: data?.gradeLevel || grade || "الصف",
      estimatedTime: data?.estimatedTime || "45 دقيقة",
      objectives: Array.isArray(data?.objectives) ? data.objectives : ["جاري صياغة الأهداف..."],
      hook: data?.hook || "نشاط تمهيدي",
      contentElements: Array.isArray(data?.contentElements) ? data.contentElements : [],
      differentiation: {
        gifted: data?.differentiation?.gifted || "نشاط إثرائي",
        support: data?.differentiation?.support || "نشاط علاجي"
      },
      assessment: {
        formative: data?.assessment?.formative || "تقييم مرحلي",
        summative: data?.assessment?.summative || "تقييم ختامي"
      }
    };
  };

  try {
    // التأكد من المفتاح
    if (!API_KEY || API_KEY.length < 5) {
      console.error("API Key is missing");
      // نرجع خطة فارغة بدل ما الموقع يقع
      return sanitize({}); 
    }

    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    // 3. تجهيز الطلب (Prompt)
    const promptText = `Act as an expert Egyptian teacher. Create a detailed lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}.
    Content: ${contentStr}.
    
    Output strictly VALID JSON.
    Structure:
    {
      "title": "Lesson Title",
      "gradeLevel": "Grade",
      "estimatedTime": "Time",
      "objectives": ["Obj1", "Obj2"],
      "hook": "Activity",
      "contentElements": [{"title": "Concept", "details": "Explanation"}],
      "differentiation": {"gifted": "Task", "support": "Task"},
      "assessment": {"formative": "Q", "summative": "Q"}
    }
    Language: Arabic.`;

    // 4. الاتصال بجوجل (الموديل المستقر)
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

    if (!rawText) throw new Error("No text returned");

    // 5. تنظيف النص وتحويله
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanText);

    // إرجاع البيانات السليمة
    return sanitize(parsedData);

  } catch (error) {
    console.error("Generation Error:", error);
    // 6. في حالة أي خطأ، نرجع رسالة توضيحية داخل الخطة بدلاً من الشاشة البيضاء
    return sanitize({
      title: topic,
      objectives: ["عذراً، حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.", "يرجى المحاولة مرة أخرى."],
      hook: "يرجى التحقق من اتصال الإنترنت."
    });
  }
};
