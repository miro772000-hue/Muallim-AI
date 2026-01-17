export interface ResourceItem {
  name: string;
  description: string;
  category: string;
  url?: string;
}

export interface QuizQuestion {
  text: string;
  type: 'multiple_choice' | 'true_false' | 'complete';
  options?: string[];
  answer: string;
}

export interface LessonPlan {
  title: string;
  gradeLevel: string;
  estimatedTime: string;
  objectives: string[];
  hook: string;
  sequence: string[];
  activities: {
    individual: string;
    group: string;
  };
  differentiation: {
    gifted: string;
    learningDifficulties: string;
  };
  resources: ResourceItem[];
  additionalResources: ResourceItem[];
  evaluation: {
    formative: string;
    authentic: string;
    summative: string;
    quiz: {
      questions: QuizQuestion[];
    };
  };
}

export type GenerationStatus = 'idle' | 'loading' | 'success' | 'error';