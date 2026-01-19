export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface LessonPlan {
  topic: string;
  grade: string;
  subject: string;
  learningOutcomes: string[];
  // التعديل هنا: عناصر الدرس أصبحت تحتوي على عنوان وتفاصيل
  contentElements: { title: string; details: string }[];
  strategies: string[];
  differentiation: {
    gifted: string;
    struggling: string;
  };
  resources: {
    reading: string[];
    video: string[];
    interactive: string[];
  };
  assessment: {
    formative: string;
    authentic: string;
    summative: string;
  };
  quiz: {
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}
