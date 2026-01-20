import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  // 1. تعريف "خطة الطوارئ" (عشان لو حصل أي كارثة، دي اللي تظهر بدل الشاشة البيضاء)
  const fallbackPlan: LessonPlan = {
    title: topic || "خطة الدرس",
    gradeLevel: grade || "عام",
    estimatedTime: "45 دقيقة",
    objectives: ["تعذر جلب الأهداف بسبب ضعف الشبكة، يرجى المحاولة مرة أخرى."],
    hook: "يرجى التحقق من اتصال الإنترنت وإعادة المحاولة.",
    contentElements: [{ title: "تنبيه", details: "حدث خطأ أثناء الاتصال بجوجل." }],
    differentiation: { gifted: "-", support: "-" },
    assessment: { formative: "-", summative: "-" }
  };

  if (!API_KEY) {
    alert("مفتاح API غير موجود.");
    return fallbackPlan;
  }

  // 2. دالة "التنظيف" (تضمن إن البيانات سليمة عشان الموقع مايقعش)
  const sanitize = (data: any): LessonPlan => {
    return {
      title: data?.title || topic,
      gradeLevel: data?.gradeLevel || grade,
      estimatedTime: data?.estimatedTime || "45 دقيقة",
      objectives: Array.isArray(data?.objectives) ? data.objectives : ["هدف 1", "هدف 2"],
      hook: data?.hook || "نشاط تمهيدي",
      contentElements: Array.isArray(data?.contentElements) ? data.contentElements : [],
      differentiation: {
        gifted: data?.differentiation?.gifted || "نشاط إثرائي",
        support: data?.differentiation?.support || "نشاط علاجي"
      },
      assessment: {
        formative: data?.assessment?.formative || "تقييم تكويني",
        summative: data?.assessment?.summative || "تقييم ختامي"
      }
    };
  };

  try {
    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    // 3. الأمر (Prompt)
    const promptText = `Act as an expert Egyptian teacher. Create a DETAILED lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}.
    Content: ${contentStr}.
    
    Output strictly VALID JSON.
    Structure:
    {
      "title": "Lesson Title",
      "gradeLevel": "Grade",
      "estimatedTime": "Time",
      "objectives": ["Smart Objective 1", "Smart Objective 2"],
      "hook": "Activity",
      "contentElements": [{"title": "Concept", "details": "Explanation"}],
      "differentiation": {"gifted": "Task", "support": "Task"},
      "assessment": {"formative": "Q", "summative": "Q"}
    }
    Language: Arabic.`;

    // 4. الاتصال
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

    if (!response.ok) throw new Error(`Google Error: ${response.status}`);

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("Empty response");

    // تنظيف JSON
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanText);

    // إرجاع البيانات النظيفة
    return sanitize(parsedData);

  } catch (error) {
    console.error("GENERATION ERROR:", error);
    // 🛑 أهم سطر: في حالة الخطأ، نرجع خطة الطوارئ بدل ما الموقع ينهار
    return sanitize({
      ...fallbackPlan,
      objectives: ["حدث خطأ في الشبكة (Network Error) أو في تحليل البيانات.", "يرجى المحاولة مرة أخرى."]
    });
  }
};
