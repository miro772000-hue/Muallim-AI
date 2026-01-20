import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  // مفتاحك الصحيح
  const API_KEY = "AIzaSyABq78Ujul5nIGCD00iFTs9JiCWFeXFaW0";

  // دالة مساعدة للاتصال بالموديل (تحاول مع موديلات مختلفة)
  const callGemini = async (modelName: string, prompt: string) => {
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
    // 1. تجهيز البيانات
    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    const promptText = `Design a comprehensive lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}.
    Content: ${contentStr}.
    
    Requirements:
    - 3-5 SMART Objectives (Bloom's Taxonomy).
    - Pedagogical Strategies (Egyptian Teacher's Guide).
    - Differentiation (Gifted/Support).
    - Evaluation (Formative, Summative, Quiz).
    - Resources: 'https://ellibrary.moe.gov.eg/books/'.
    - Output in Arabic.
    - RETURN ONLY RAW JSON.`;

    let data;
    try {
      // المحاولة الأولى: الموديل السريع
      console.log("Trying gemini-1.5-flash...");
      data = await callGemini("gemini-1.5-flash", promptText);
    } catch (e) {
      // المحاولة الثانية: الموديل المستقر (الخطة البديلة)
      console.log("Flash failed, trying gemini-pro...");
      data = await callGemini("gemini-pro", promptText);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No text returned from Gemini.");

    // تنظيف الرد
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText) as LessonPlan;

  } catch (error) {
    console.error("All models failed:", error);
    // رسالة خطأ واضحة للمستخدم
    alert("عذراً، حدث خطأ في الاتصال بخدمة الذكاء الاصطناعي. يرجى المحاولة لاحقاً.");
    throw error;
  }
};
