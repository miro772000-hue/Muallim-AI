import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  const API_KEY = "AIzaSyABq78Ujul5nIGCD00iFTs9JiCWFeXFaW0";
  
  // دالة لإظهار الخطأ بوضوح
  const showError = (msg: string) => {
    alert(`تفاصيل الخطأ: ${msg}`);
    console.error(msg);
  };

  try {
    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    const promptText = `Act as an expert Egyptian teacher. Create a lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}.
    Content: ${contentStr}.
    
    Format: JSON only.
    Language: Arabic.
    Structure: {
      "title": "Lesson Title",
      "gradeLevel": "Grade",
      "estimatedTime": "Time",
      "objectives": ["Obj1", "Obj2"],
      "hook": "Activity",
      "contentElements": [{"title": "Subtopic", "details": "Explanation"}],
      "differentiation": {"gifted": "Activity", "support": "Activity"},
      "assessment": {"formative": "Q", "summative": "Q"}
    }`;

    // استخدام موديل فلاش السريع مع تعطيل الفلاتر
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        // 🛑 إلغاء فلاتر الأمان عشان يقبل المحتوى العربي
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || response.statusText;
      showError(`خطأ من جوجل (${response.status}): ${errorMessage}`);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // التأكد من وجود رد، ولو مفيش يبقى الفلتر لسه شغال
    if (!data.candidates || data.candidates.length === 0) {
        if (data.promptFeedback) {
            showError(`تم حجب الرد بسبب الفلاتر: ${JSON.stringify(data.promptFeedback)}`);
        } else {
            showError("لم يصل أي رد من جوجل (Empty Response).");
        }
        throw new Error("No candidates");
    }

    const text = data.candidates[0].content?.parts?.[0]?.text;
    if (!text) throw new Error("No text found.");

    // تنظيف الرد من علامات الكود
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanText) as LessonPlan;

  } catch (error: any) {
    console.error("Final Error:", error);
    // لو الخطأ مش ظاهر في التنبيه اللي فوق، نظهره هنا
    if (!error.message.includes("تفاصيل")) {
        alert(`حدث خطأ غير متوقع: ${error.message}`);
    }
    throw error;
  }
};
