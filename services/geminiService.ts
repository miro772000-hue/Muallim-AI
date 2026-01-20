import { LessonPlan } from "../types";

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  
  console.log("بدء اختبار المحاكاة...");

  // 1. محاكاة وقت التحميل (انتظار 3 ثواني وكأننا بنتصل بجوجل)
  await new Promise(resolve => setTimeout(resolve, 3000));

  // 2. إرجاع بيانات ثابتة (بدون أي اتصال حقيقي)
  // الهدف: التأكد هل الصفحة قادرة تعرض بيانات ولا لأ؟
  return {
    title: topic || "درس تجريبي (وضع الاختبار)",
    gradeLevel: grade || "الرابع الابتدائي",
    estimatedTime: "45 دقيقة",
    objectives: [
      "أن يذكر الطالب أهمية هذا الاختبار.",
      "أن يميز الطالب بين المشكلة التقنية ومشكلة الشبكة.",
      "أن يستنتج الطالب الحل الصحيح."
    ],
    hook: "هل تعلم أن هذا النص مكتوب مسبقاً لاختبار التطبيق؟",
    contentElements: [
      { 
        title: "ماذا يحدث الآن؟", 
        details: "نحن نقوم بفصل الذكاء الاصطناعي مؤقتاً للتأكد من سلامة واجهة الموقع." 
      },
      { 
        title: "الخطوة التالية", 
        details: "إذا ظهرت هذه الخطة، فالموقع سليم والمشكلة في المفتاح. إذا ظهرت شاشة بيضاء، فالمشكلة في كود العرض (React)." 
      }
    ],
    differentiation: {
      gifted: "تمرين إضافي للمتفوقين.",
      support: "تمرين مبسط للدعم."
    },
    assessment: {
      formative: "سؤال سريع أثناء الحصة.",
      summative: "واجب منزلي بسيط."
    }
  };
};
