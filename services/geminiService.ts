import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  // 1. جلب المفتاح من Vercel
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  if (!API_KEY || API_KEY.length < 10) {
    alert("تنبيه: مفتاح API غير موجود. تأكد من إعدادات Vercel.");
    throw new Error("Missing API Key");
  }

  // 2. دالة تنظيف ذكية لاستخراج JSON حتى لو كان الرد طويلاً جداً
  const cleanAndParseJSON = (text: string): any => {
    try {
      // إزالة علامات الكود (Markdown)
      let clean = text.replace(/```json/g, '').replace(/```/g, '');
      
      // محاولة العثور على بداية ونهاية كائن JSON
      const firstBrace = clean.indexOf('{');
      const lastBrace = clean.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        clean = clean.substring(firstBrace, lastBrace + 1);
      }
      
      return JSON.parse(clean);
    } catch (e) {
      console.error("JSON Parse Error:", e);
      throw new Error("فشل في قراءة تنسيق الخطة، يرجى المحاولة مرة أخرى.");
    }
  };

  try {
    const modelName = "models/gemini-pro";

    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    // 3. الأمر (Prompt) المعدل لطلب التفاصيل والشمولية
    const promptText = `Act as a senior expert Egyptian teacher. Create a HIGHLY DETAILED and COMPREHENSIVE lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}.
    Content: ${contentStr}.
    
    CRITICAL INSTRUCTIONS:
    - Output MUST be valid JSON only.
    - Do NOT summarize. Be verbose and detailed.
    - Objectives: Write 3-5 distinct, measurable SMART objectives.
    - Content: Provide detailed explanations, not just headlines.
    - Procedures: Describe the teacher's role and student's role in detail.
    - Assessment: Provide specific questions, not general ideas.
    
    Structure:
    {
      "title": "Lesson Title",
      "gradeLevel": "${grade}",
      "estimatedTime": "45 min",
      "objectives": ["Detailed Objective 1", "Detailed Objective 2", "Detailed Objective 3"],
      "hook": "Engaging starter activity description",
      "contentElements": [
        {"title": "Main Idea 1", "details": "Comprehensive explanation of the concept..."}, 
        {"title": "Main Idea 2", "details": "Comprehensive explanation of the concept..."}
      ],
      "differentiation": {
        "gifted": "Challenging activity description...", 
        "support": "Remedial activity description..."
      },
      "assessment": {
        "formative": "Specific questions to ask during class...", 
        "summative": "Quiz questions or homework..."
      }
    }
    Language: Arabic (Modern Standard Arabic).`;

    // 4. الاتصال
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
      const err = await response.json();
      throw new Error(err.error?.message || "Google API Error");
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("No text returned.");

    // 5. التحويل والتنظيف
    return cleanAndParseJSON(rawText) as LessonPlan;

  } catch (error: any) {
    console.error("Service Error:", error);
    // رسالة تنبيه واضحة بدلاً من الشاشة البيضاء
    alert("حدث خطأ أثناء معالجة البيانات التفصيلية. يرجى المحاولة مرة أخرى.");
    
    // إرجاع كائن فارغ لتجنب انهيار الصفحة (الشاشة البيضاء)
    return {
      title: topic,
      gradeLevel: grade,
      estimatedTime: "45 دقيقة",
      objectives: ["تعذر تحميل الأهداف التفصيلية، حاول مرة أخرى."],
      hook: "",
      contentElements: [],
      differentiation: { gifted: "", support: "" },
      assessment: { formative: "", summative: "" }
    };
  }
};
