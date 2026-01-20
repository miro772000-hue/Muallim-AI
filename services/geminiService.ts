import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  // 1. جلب المفتاح من Vercel
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  if (!API_KEY || API_KEY.length < 10) {
    alert("تنبيه: مفتاح API غير موجود. تأكد من إعدادات Vercel.");
    throw new Error("Missing API Key");
  }

  // 2. دالة ذكية لإصلاح الردود المكسورة (Anti-Crash)
  // وظيفتها: لو الرد انقطع في النص، نقفله احنا عشان مايطلعش ايرور
  const safeJSONParse = (text: string): any => {
    try {
      // محاولة استخراج JSON نظيف
      let clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // لو فيه قوس زيادة في الأول أو ناقص في الآخر، نحاول نصلحه
      const firstBrace = clean.indexOf('{');
      if (firstBrace !== -1) clean = clean.substring(firstBrace);
      
      // المحاولة الأولى: تحويل مباشر
      return JSON.parse(clean);
    } catch (e) {
      // المحاولة الثانية: لو فشل، بنحاول نقفل القوس يدوياً لو مقطوع
      try {
         const lastBrace = text.lastIndexOf('}');
         if (lastBrace !== -1) {
            const subClean = text.substring(text.indexOf('{'), lastBrace + 1);
            return JSON.parse(subClean);
         }
      } catch (e2) {
         console.error("Parsing failed completely:", e2);
         return null; // فشل تام
      }
    }
    return null;
  };

  try {
    const strategiesStr = Array.isArray(strategies) ? strategies.join(', ') : (strategies || '');
    const contentStr = Array.isArray(contentElements) ? contentElements.join(', ') : (contentElements || '');
    
    // 3. الأمر (Prompt)
    // طلبنا التفاصيل، لكن ضفنا جملة مهمة: "تأكد من إغلاق الأقواس"
    const promptText = `Act as an expert Egyptian teacher. Create a DETAILED lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategiesStr}.
    Content: ${contentStr}.
    
    IMPORTANT: 
    - Output VALID JSON ONLY. 
    - Be detailed but ensure the JSON object is COMPLETE and closed properly.
    - If you run out of tokens, prioritize closing the JSON structure over adding more text.
    
    Structure:
    {
      "title": "Lesson Title",
      "gradeLevel": "${grade}",
      "estimatedTime": "45 min",
      "objectives": ["Objective 1", "Objective 2", "Objective 3"],
      "hook": "Activity description",
      "contentElements": [
        {"title": "Section 1", "details": "Detailed explanation..."}, 
        {"title": "Section 2", "details": "Detailed explanation..."}
      ],
      "differentiation": {
        "gifted": "Activity", 
        "support": "Activity"
      },
      "assessment": {
        "formative": "Questions", 
        "summative": "Homework"
      }
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

    if (!response.ok) throw new Error("Google API Error");

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("No text returned.");

    // 5. محاولة التحليل الآمن
    const parsedData = safeJSONParse(rawText);

    // 6. شبكة الأمان الأخيرة (Fallback)
    // لو كل المحاولات فشلت، مش هنطلع ايرور، هنعرض النص الموجود وخلاص
    if (!parsedData) {
        return {
            title: topic,
            gradeLevel: grade,
            estimatedTime: "45 دقيقة",
            objectives: ["حدث خطأ في التنسيق، لكن تم جلب المحتوى بالأسفل."],
            hook: "يرجى مراجعة قسم المحتوى.",
            contentElements: [
                { title: "النص الخام للخطة (بسبب طول الرد)", details: rawText }
            ],
            differentiation: { gifted: "-", support: "-" },
            assessment: { formative: "-", summative: "-" }
        };
    }

    return parsedData as LessonPlan;

  } catch (error: any) {
    console.error("Final Error:", error);
    // حتى في حالة الخطأ الشديد، بنرجع خطة فاضية عشان الموقع مايقعش
    return {
        title: topic,
        gradeLevel: grade,
        estimatedTime: "غير محدد",
        objectives: ["عذراً، حدث خطأ في الاتصال."],
        hook: "حاول مرة أخرى.",
        contentElements: [],
        differentiation: { gifted: "", support: "" },
        assessment: { formative: "", summative: "" }
    };
  }
};
