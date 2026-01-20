import { LessonPlan } from "../types";

// هذا الكود يتصل بجوجل مباشرة لتجنب مشاكل المكتبات القديمة
export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  try {
    // مفتاحك تم وضعه هنا مباشرة
    const API_KEY = "AIzaSyABq78Ujul5nIGCD00iFTs9JiCWFeXFaW0";

    // 1. تجهيز البيانات
    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    // 2. بناء الأمر (Prompt)
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

    // 3. الاتصال المباشر (Direct Call)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API Error:", errorData);
      throw new Error(`Google API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No text returned from Gemini.");

    // 4. تنظيف الرد من علامات الكود
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanText) as LessonPlan;

  } catch (error) {
    console.error("Final Error generating lesson plan:", error);
    throw error;
  }
};
