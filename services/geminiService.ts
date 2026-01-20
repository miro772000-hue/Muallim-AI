import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LessonPlan } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || "12345" });

const lessonPlanSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Lesson Title in Arabic" },
    gradeLevel: { type: Type.STRING, description: "Grade Level in Arabic" },
    estimatedTime: { type: Type.STRING, description: "Estimated Time in Arabic" },
    objectives: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of SMART objectives in Arabic",
    },
    hook: { type: Type.STRING, description: "The Hook / Introduction activity in Arabic" },
    contentElements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Lesson section title in Arabic" },
          details: { type: Type.STRING, description: "Detailed scientific explanation (3-4 sentences) for this section in Arabic" }
        },
      },
    },
    activities: {
      type: Type.OBJECT,
      properties: {
        individual: { type: Type.STRING, description: "Individual activity description in Arabic" },
        group: { type: Type.STRING, description: "Group activity description in Arabic" },
      },
      required: ["individual", "group"],
    },
    differentiation: {
      type: Type.OBJECT,
      properties: {
        gifted: { type: Type.STRING, description: "A distinct, challenging enrichment activity for gifted students (Higher Order Thinking) in Arabic" },
        learningDifficulties: { type: Type.STRING, description: "A distinct, simplified support activity for students with learning difficulties (Visual/Concrete) in Arabic" },
      },
      required: ["gifted", "learningDifficulties"],
    },
    resources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the resource in Arabic" },
          description: { type: Type.STRING, description: "Brief description of why this resource is useful in Arabic" },
          category: { type: Type.STRING, description: "Category of the resource (e.g., خريطة, فيديو, قراءة, تفاعلي) in Arabic" },
          url: { type: Type.STRING, description: "A valid URL link to the resource. MUST be a working link or a search query link." }
        },
        required: ["name", "description", "category"]
      },
      description: "List of essential learning resources in Arabic with descriptions, categories, and URLs",
    },
    additionalResources: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the additional resource in Arabic" },
          description: { type: Type.STRING, description: "Brief description of the enrichment material in Arabic" },
          category: { type: Type.STRING, description: "Category of the resource (e.g., خريطة, فيديو, قراءة, تفاعلي) in Arabic" },
          url: { type: Type.STRING, description: "A valid URL link to the resource" }
        },
        required: ["name", "description", "category"]
      },
      description: "List of optional enrichment materials in Arabic with descriptions, categories, and URLs",
    },
    evaluation: {
      type: Type.OBJECT,
      properties: {
        formative: { type: Type.STRING, description: "Formative assessment strategy in Arabic" },
        authentic: { type: Type.STRING, description: "Authentic assessment task in Arabic" },
        summative: { type: Type.STRING, description: "Summative assessment task description in Arabic" },
        quiz: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING, description: "Question text in Arabic" },
                  type: { type: Type.STRING, description: "Type: 'multiple_choice', 'true_false', or 'complete'" },
                  options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Options for MCQs (optional for other types)" },
                  answer: { type: Type.STRING, description: "The correct answer in Arabic" }
                },
                required: ["text", "type", "answer"]
              },
              description: "List of 3-5 quiz questions"
            }
          },
          required: ["questions"]
        }
      },
      required: ["formative", "authentic", "summative", "quiz"],
    },
  },
  required: [
    "title",
    "gradeLevel",
    "estimatedTime",
    "objectives",
    "hook",
    "contentElements",
    "activities",
    "differentiation",
    "resources",
    "additionalResources",
    "evaluation",
  ],
};

const SYSTEM_INSTRUCTION = `
You are an expert Instructional Designer and Senior Curriculum Consultant for the Egyptian Ministry of Education (MoE). Your expertise is specifically in the official Egyptian curriculum for Social Studies, Geography, and History.

YOUR CORE MANDATE:
Generate professional, academically rigorous lesson plans that strictly adhere to the official curriculum documents and standards (CCIMD) of Egypt.

CRITICAL: OBJECTIVES & BLOOM'S REVISED TAXONOMY
You must draft SMART learning objectives based on **Bloom's Revised Taxonomy**, strictly adapted to the cognitive level of the educational stage:

1. **Primary Stage (Grades 4-6)**:
   - **Focus**: Lower Order Thinking Skills (Remembering, Understanding, Applying).
   - **Appropriate Verbs**: يذكر (List), يحدد (Identify), يصف (Describe), يوضح (Explain), يطبق (Apply), يرسم (Draw), يوقع على الخريطة (Locate on map).

2. **Preparatory Stage (Grades 7-9)**:
   - **Focus**: Middle Order Thinking Skills (Applying, Analyzing, Evaluating).
   - **Appropriate Verbs**: يقارن (Compare), يحلل (Analyze), يستنتج (Infer), يفسر أسباب (Interpret reasons), يميز بين (Distinguish), ينقد (Critique).

3. **Secondary Stage (Grades 10-12)**:
   - **Focus**: Higher Order Thinking Skills (Evaluating, Creating).
   - **Appropriate Verbs**: يقيم (Evaluate), يفند (Refute), يبرهن (Prove), يصمم (Design), يقترح حلولاً إبداعية (Propose creative solutions), يتنبأ (Predict), يصدر حكماً (Judge).

CRITICAL: STRATEGY IMPLEMENTATION
If the user selects specific Active Learning Strategies, you must apply them CORRECTLY according to their pedagogical steps:

1. **Mantle of the Expert (عباءة الخبير)**: Create a fictional context/drama where students act as expert teams (e.g., "You are a team of UNESCO archaeologists...") commissioned to solve a problem. The learning happens through this role-play.
2. **Six Thinking Hats (قبعات التفكير)**: Explicitly structure the discussion using the hats (White: Facts, Red: Feelings, Black: Cautions, Yellow: Benefits, Green: Creativity, Blue: Process).
3. **Flipped Classroom (التعلم المعكوس)**: Clearly state: "Pre-class: Watch video X/Read text Y" AND "In-class: Apply concepts to solve Z".
4. **WebQuest (الرحلات المعرفية عبر الويب)**: Design an inquiry-oriented activity where students use specific web links to find answers to a central question.
5. **Fishbone Strategy (عظمة السمكة)**: Use strictly for Cause-and-Effect analysis (Problem at head, Causes on spines).
6. **Think-Pair-Share (فكر-زاوج-شارك)**: Clearly delineate the three phases: Individual thinking -> Partner discussion -> Class sharing.
7. **Dialogue and Discussion (الحوار والمناقشة)**: Use structured Socratic questioning. Do not just say "discuss". Provide the key guiding questions the teacher should ask to stimulate critical thinking.
8. **Jigsaw (جيجسو)**: Explain how the home groups and expert groups are divided and what specific segment each group masters.

CRITICAL: DIFFERENTIATION (ADDITIONAL ACTIVITIES)
You must generate distinct, specific, and high-quality additional activities for:

1. **Gifted Students (المتفوقين)**:
   - **Type**: Enrichment & Extension.
   - **Focus**: Higher-order thinking, abstract concepts, research, and synthesis.
   - **Example**: "Compare this historical event with a current global issue," "Write a newspaper editorial from the perspective of...", "Design a map for a future city based on the geographical constraints learned."
   - **Do NOT**: Just give them more of the same exercises.

2. **Students with Learning Difficulties (ذوي صعوبات التعلم)**:
   - **Type**: Support & Accommodation.
   - **Focus**: Simplification, visualization, concrete examples, and scaffolding.
   - **Example**: "Sort images into categories," "Fill in the blanks with a provided word bank," "Draw the main event of the battle," "Use a simplified timeline with pictures."
   - **Do NOT**: Simply say "help them". Provide a specific task they can do.

CRITICAL: SHORT QUIZ
Include a **Short Quiz** in the evaluation section containing 3-5 objective questions (Multiple Choice, True/False, or Complete) directly related to the lesson objectives. Provide the correct answer for each.

IMPORTANT: PROVIDE WORKING, RELIABLE LINKS
For the 'resources' and 'additionalResources' sections, you must provide valid URLs. To ensure links work for the user, follow these rules:
1. **YouTube**: Unless you know a specific, permanent video URL, provide a **Search URL**. 
   - Example: \`https://www.youtube.com/results?search_query=شرح+الحملة+الفرنسية+على+مصر\`
2. **Wikipedia**: Use the direct Arabic Wikipedia article link.
   - Example: \`https://ar.wikipedia.org/wiki/نهر_النيل\`
3. **General Search**: If a specific resource link is hard to guarantee, use a Google Search link for the specific file type or topic.
   - Example: \`https://www.google.com/search?q=خريطة+تضاريس+مصر+pdf\`
4. **EKB**: Point to the main portal or a search link.
5. **Ministry Textbooks & Portal**: ALWAYS use this exact URL when referring to the Ministry of Education books, curriculum portal, or E-Library: \`https://ellibrary.moe.gov.eg/books/\`.

CONTENT INTEGRITY:
*   Definitions and facts must match Egyptian government textbooks.
*   Language: High-quality Modern Standard Arabic (MSA).
`;

export const generateLessonPlan = async (topic: string, grade: string, subject: string, strategies?: string[], contentElements?: string[]): Promise<LessonPlan> => {
  try {
    // 🛑 ضعي مفتاحك الجديد هنا مكان الجملة الانجليزية وحافظي على علامات التنصيص
    // مثال: const API_KEY = "AIzaSyDxxxxxxxxxxxxxxx";
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

    // 3. الاتصال المباشر (Direct Call) لتجاوز مشاكل المكتبة
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

    // 4. تنظيف الرد
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanText) as LessonPlan;

  } catch (error) {
    console.error("Final Error generating lesson plan:", error);
    throw error;
  }
};
