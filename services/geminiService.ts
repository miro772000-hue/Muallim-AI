import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  const API_KEY = "AIzaSyABq78Ujul5nIGCD00iFTs9JiCWFeXFaW0";
  
  // دالة مساعدة لاكتشاف الموديل المتاح تلقائياً
  const getAvailableModel = async (): Promise<string> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
      const data = await response.json();
      
      if (!data.models) return "models/gemini-pro"; // اسم احتياطي

      // البحث عن أول موديل يدعم التلخيص والإنشاء
      const validModel = data.models.find((m: any) => 
        m.name.includes('gemini') && 
        m.supportedGenerationMethods?.includes('generateContent')
      );

      return validModel ? validModel.name : "models/gemini-pro";
    } catch (e) {
      console.error("فشل اكتشاف الموديل، سنستخدم الافتراضي", e);
      return "models/gemini-pro";
    }
  };

  try {
    // 1. اكتشاف اسم الموديل الصحيح المتاح لحسابك
    const modelName = await getAvailableModel();
    console.log("تم اختيار الموديل تلقائياً:", modelName);

    // 2. تجهيز البيانات
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

    // 3. الاتصال بالموديل المكتشف
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${API_KEY}`, {
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
      throw new Error(errorData.error?.message || response.statusText);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No text found.");

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as LessonPlan;

  } catch (error: any) {
    console.error("Final Error:", error);
    alert(`عذراً، حدث خطأ: ${error.message}`);
    throw error;
  }
};
