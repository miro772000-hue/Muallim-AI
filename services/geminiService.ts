import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  // 🟢 هذا السطر يأخذ المفتاح من إعدادات Vercel السرية ولا يظهره في الكود
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  // التحقق من وجود المفتاح
  if (!API_KEY || API_KEY.length < 10) {
    alert("تنبيه: مفتاح API غير موجود في إعدادات Vercel. يرجى إضافته في Environment Variables.");
    throw new Error("Missing API Key");
  }

  // دالة ذكية لاختيار الموديل المناسب تلقائياً
  const getAvailableModel = async (): Promise<string> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
      const data = await response.json();
      
      // محاولة العثور على موديل يدعم التوليد
      if (data.models) {
        const validModel = data.models.find((m: any) => 
          m.name.includes('gemini') && 
          m.supportedGenerationMethods?.includes('generateContent')
        );
        if (validModel) return validModel.name;
      }
      return "models/gemini-pro"; // الموديل الاحتياطي
    } catch (e) {
      return "models/gemini-pro";
    }
  };

  try {
    const modelName = await getAvailableModel();
    console.log("Using Model:", modelName);

    // تجهيز البيانات
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

    // الاتصال الآمن
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
    console.error("Error:", error);
    alert("حدث خطأ أثناء الاتصال. تأكد من إعدادات المفتاح في Vercel.");
    throw error;
  }
};
