import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

  const sanitize = (data: any): LessonPlan => {
    return {
      title: data?.title || topic || "عنوان الدرس",
      gradeLevel: data?.gradeLevel || grade || "غير محدد",
      estimatedTime: data?.estimatedTime || "45 دقيقة",
      objectives: Array.isArray(data?.objectives) ? data.objectives : ["جاري التحميل..."],
      hook: data?.hook || "نشاط تمهيدي",
      contentElements: Array.isArray(data?.contentElements) ? data.contentElements : [],
      differentiation: { 
        gifted: data?.differentiation?.gifted || "أنشطة إثرائية", 
        support: data?.differentiation?.support || "أنشطة علاجية" 
      },
      assessment: { 
        formative: data?.assessment?.formative || "تقويم تكويني", 
        summative: data?.assessment?.summative || "تقويم ختامي" 
      }
    };
  };

  try {
    if (!API_KEY) throw new Error("المفتاح غير موجود");

    // 1️⃣ الخطوة الأولى: نسأل جوجل "إيه الموديل المتاح لينا؟" (بما إن دي نجحت معاكي)
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    if (!listResponse.ok) throw new Error("فشل الوصول لقائمة الموديلات");
    
    const listData = await listResponse.json();
    
    // نختار أول موديل "فلاش" أو "برو" من القائمة اللي رجعت
    const model = listData.models?.find((m: any) => m.name.includes("gemini-1.5-flash") || m.name.includes("gemini-pro"));
    
    // لو ملقيناش، ناخد أول واحد وخلاص، المهم يكون اسمه صح
    const targetModelName = model ? model.name : "models/gemini-1.5-flash"; 
    
    // ننظف الاسم (نشيل كلمة models/ لو موجودة عشان التوافق)
    const cleanModelName = targetModelName.replace("models/", "");

    console.log("Selected Model:", cleanModelName); // عشان نتأكد

    // 2️⃣ الخطوة الثانية: نطلب الخطة باستخدام الاسم الصحيح
    const promptText = `Act as an expert Egyptian teacher. Create a detailed lesson plan for: "${topic}".
    Subject: ${subject}. Grade: ${grade}.
    Strategies: ${strategies || "Interactive"}.
    Content: ${contentElements || "Core concepts"}.
    Output strictly VALID JSON. Language: Arabic.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${cleanModelName}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Google Error: ${errorData.error?.message}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return sanitize(JSON.parse(cleanText));

  } catch (error: any) {
    console.error("Final Error:", error);
    return sanitize({
      objectives: [
        "حدث خطأ غير متوقع:",
        error.message
      ]
    });
  }
};
