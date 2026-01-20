import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  // مفتاحك
  const API_KEY = "AIzaSyABq78Ujul5nIGCD00iFTs9JiCWFeXFaW0";
  
  const showError = (msg: string) => {
    alert(`تفاصيل الخطأ: ${msg}`);
    console.error(msg);
  };

  try {
    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    // بناء الطلب
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

    // 🛑 التعديل هنا: استخدام الاسم الرقمي الدقيق (gemini-1.0-pro)
    // ده الاسم اللي السيرفرات القديمة والجديدة بتشوفه
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${API_KEY}`, {
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

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || response.statusText;
      // لو حتى ده فشل، هنظهر الرسالة عشان نعرف الخطوة الجاية
      showError(`خطأ جوجل (${response.status}): ${errorMessage}`);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
        showError("جوجل رد برد فاضي (Empty Response).");
        throw new Error("No candidates");
    }

    const text = data.candidates[0].content?.parts?.[0]?.text;
    if (!text) throw new Error("No text found.");

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as LessonPlan;

  } catch (error: any) {
    console.error("Final Error:", error);
    if (!error.message.includes("تفاصيل")) {
        alert(`حدث خطأ: ${error.message}`);
    }
    throw error;
  }
};
