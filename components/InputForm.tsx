import React, { useState, useEffect } from 'react';
import { Search, Loader2, Sparkles, ChevronDown, CheckCircle2, Circle, Lightbulb, Brain, Check, X, Plus, BookOpen } from 'lucide-react';

interface InputFormProps {
  onGenerate: (topic: string, grade: string, subject: string, strategies: string[], contentElements: string[]) => void;
  isLoading: boolean;
}

const subjectsList = [
  "الجغرافيا",
  "الدراسات الاجتماعية",
  "التاريخ"
];

const stages: Record<string, { label: string; grades: string[] }> = {
  primary: {
    label: "المرحلة الابتدائية",
    grades: [
      "الصف الأول الابتدائي", "الصف الثاني الابتدائي", "الصف الثالث الابتدائي",
      "الصف الرابع الابتدائي", "الصف الخامس الابتدائي", "الصف السادس الابتدائي"
    ]
  },
  preparatory: {
    label: "المرحلة الإعدادية",
    grades: [
      "الصف الأول الإعدادي", "الصف الثاني الإعدادي", "الصف الثالث الإعدادي"
    ]
  },
  secondary: {
    label: "المرحلة الثانوية",
    grades: [
      "الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي"
    ]
  }
};

const activeLearningStrategies = [
  "العصف الذهني (Brainstorming)",
  "التعلم التعاوني (Cooperative Learning)",
  "الحوار والمناقشة (Dialogue and Discussion)",
  "عباءة الخبير (Mantle of the Expert)",
  "قبعات التفكير الست (Six Thinking Hats)",
  "التعلم المعكوس (Flipped Classroom)",
  "الرحلات المعرفية عبر الويب (WebQuests)",
  "إستراتيجية عظمة السمكة (Fishbone Strategy)",
  "جدول التعلم (K.W.L)",
  "فكر - زاوج - شارك (Think-Pair-Share)",
  "لعب الأدوار (Role Playing)",
  "حل المشكلات (Problem Solving)",
  "الاستقصاء والاكتشاف (Inquiry Based)",
  "استراتيجية (Jigsaw)",
  "الرؤوس المرقمة (Numbered Heads)",
  "الخرائط الذهنية (Mind Maps)",
  "الخرائط المفاهيمية (Concept Maps)",
  "التعلم باللعب / التلعيب (Gamification)",
  "تعلم الأقران (Peer Teaching)",
  "التفكير الناقد (Critical Thinking)",
  "مسرحة المناهج (Dramatization)"
];

const steps = [
  { label: 'تحليل الطلب', message: 'جاري تحليل موضوع الدرس...' },
  { label: 'الأهداف', message: 'صياغة نواتج التعلم وفق تصنيف بلوم...' },
  { label: 'الاستراتيجية', message: 'تضمين استراتيجيات التعلم النشط المختارة...' },
  { label: 'الأنشطة', message: 'تصميم أنشطة تراعي الفروق الفردية...' },
  { label: 'المصادر', message: 'تحديد مصادر التعلم الرقمية والتقليدية...' },
  { label: 'التقويم', message: 'إعداد أدوات القياس والتقويم...' }
];

const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [stage, setStage] = useState('');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  
  // Content Elements State
  const [contentElements, setContentElements] = useState<string[]>([]);
  const [currentElement, setCurrentElement] = useState('');

  // Strategies State
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [isStrategiesOpen, setIsStrategiesOpen] = useState(false);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [currentStrategyIndex, setCurrentStrategyIndex] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      setCurrentStep(0);
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 3000); // Slightly longer to allow reading strategies
    } else {
      setCurrentStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Effect to cycle through active learning strategies when on the "Strategy" step
  useEffect(() => {
    let strategyInterval: ReturnType<typeof setInterval>;
    if (isLoading && steps[currentStep].label === 'الاستراتيجية') {
      // If user selected strategies, cycle through those, otherwise cycle through all
      const strategiesPool = selectedStrategies.length > 0 ? selectedStrategies : activeLearningStrategies;
      
      strategyInterval = setInterval(() => {
        setCurrentStrategyIndex((prev) => (prev + 1) % strategiesPool.length);
      }, selectedStrategies.length > 0 ? 1000 : 400); 
    }
    return () => clearInterval(strategyInterval);
  }, [isLoading, currentStep, selectedStrategies]);

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStage(e.target.value);
    setGrade(''); // Reset grade when stage changes
  };

  const toggleStrategy = (strategy: string) => {
    setSelectedStrategies(prev => 
      prev.includes(strategy) 
        ? prev.filter(s => s !== strategy)
        : [...prev, strategy]
    );
  };

  const handleAddElement = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (currentElement.trim()) {
      if (!contentElements.includes(currentElement.trim())) {
        setContentElements([...contentElements, currentElement.trim()]);
      }
      setCurrentElement('');
    }
  };

  const handleRemoveElement = (elementToRemove: string) => {
    setContentElements(prev => prev.filter(e => e !== elementToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onGenerate(topic, grade, subject, selectedStrategies, contentElements);
    }
  };

  const availableGrades = stage ? stages[stage].grades : [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 mb-8 no-print">
      <div className="mb-6 text-right">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">إعداد خطة درس جديدة</h2>
        <p className="text-slate-600">أدخل موضوع الدرس، الصف، والمادة للحصول على خطة درس شاملة ومتوافقة مع المناهج المصرية.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3">
            <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-2">
              عنوان أو موضوع الدرس
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                id="topic"
                className="block w-full pr-10 pl-3 py-3 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-right"
                placeholder="مثال: التغير المناخي، تضاريس الوطن العربي، الحملة الفرنسية..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
              المادة الدراسية
            </label>
            <div className="relative">
              <select
                id="subject"
                className="block w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors appearance-none bg-white text-right"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isLoading}
              >
                <option value="">اختر المادة...</option>
                {subjectsList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-slate-700 mb-2">
              المرحلة التعليمية
            </label>
            <div className="relative">
              <select
                id="stage"
                className="block w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors appearance-none bg-white text-right"
                value={stage}
                onChange={handleStageChange}
                disabled={isLoading}
              >
                <option value="">اختر المرحلة...</option>
                {Object.entries(stages).map(([key, data]) => (
                  <option key={key} value={key}>{data.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-slate-700 mb-2">
              الصف الدراسي
            </label>
            <div className="relative">
              <select
                id="grade"
                className="block w-full px-3 py-3 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors appearance-none bg-white text-right disabled:bg-slate-50 disabled:text-slate-400"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                disabled={isLoading || !stage}
              >
                <option value="">
                  {!stage ? 'اختر المرحلة أولاً...' : 'اختر الصف...'}
                </option>
                {availableGrades.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Content Elements Input (Optional) - NEW SECTION */}
          <div className="md:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
             <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
               <BookOpen size={16} className="text-emerald-600" />
               عناصر الدرس / المحتوى (اختياري)
             </label>
             <p className="text-xs text-slate-500 mb-3">
               يمكنك إضافة العناوين الرئيسية أو النقاط التي ترغب في تغطيتها في الدرس لتطابق الكتاب المدرسي.
             </p>
             
             <div className="flex gap-2">
                <div className="relative flex-grow">
                   <input
                     type="text"
                     className="block w-full pl-3 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                     placeholder="أضف عنصراً (مثال: أسباب الحملة، النتائج العلمية، المقاومة...)"
                     value={currentElement}
                     onChange={(e) => setCurrentElement(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleAddElement(e)}
                     disabled={isLoading}
                   />
                </div>
                <button
                   type="button"
                   onClick={handleAddElement}
                   disabled={isLoading || !currentElement.trim()}
                   className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   title="إضافة عنصر"
                >
                  <Plus size={20} />
                </button>
             </div>

             {/* Elements List */}
             {contentElements.length > 0 && (
               <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
                 {contentElements.map((element, idx) => (
                   <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                     {element}
                     {!isLoading && (
                       <button
                         type="button"
                         onClick={() => handleRemoveElement(element)}
                         className="text-slate-400 hover:text-red-500 transition-colors"
                       >
                         <X size={14} />
                       </button>
                     )}
                   </span>
                 ))}
               </div>
             )}
          </div>

          {/* Active Learning Strategies Multi-select */}
          <div className="md:col-span-3">
             <label className="block text-sm font-medium text-slate-700 mb-2">
               استراتيجيات التعلم النشط (اختياري)
             </label>
             <div className="relative">
                {isStrategiesOpen && <div className="fixed inset-0 z-40" onClick={() => setIsStrategiesOpen(false)} />}
                
                <button
                  type="button"
                  onClick={() => !isLoading && setIsStrategiesOpen(!isStrategiesOpen)}
                  disabled={isLoading}
                  className="relative w-full min-h-[50px] px-3 py-3 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white text-right flex justify-between items-center disabled:bg-slate-50"
                >
                   <div className="flex flex-wrap gap-2">
                     {selectedStrategies.length === 0 && <span className="text-slate-400">اضغط لاختيار استراتيجيات محددة...</span>}
                     {selectedStrategies.map(s => (
                        <span key={s} className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 z-50">
                          {s.split('(')[0].trim()}
                          {!isLoading && (
                            <X size={14} className="cursor-pointer hover:text-emerald-900 bg-emerald-200/50 rounded-full p-0.5" onClick={(e) => { e.stopPropagation(); toggleStrategy(s); }} />
                          )}
                        </span>
                     ))}
                   </div>
                   <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isStrategiesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isStrategiesOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in-up">
                    {activeLearningStrategies.map((strategy) => (
                      <div 
                        key={strategy}
                        onClick={() => toggleStrategy(strategy)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                      >
                         <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedStrategies.includes(strategy) ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'}`}>
                            {selectedStrategies.includes(strategy) && <Check size={14} />}
                         </div>
                         <span className={`text-sm ${selectedStrategies.includes(strategy) ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                           {strategy}
                         </span>
                      </div>
                    ))}
                  </div>
                )}
             </div>
             <p className="text-xs text-slate-400 mt-1.5 mr-1">يمكنك اختيار أكثر من استراتيجية لدمجها في الخطة.</p>
          </div>
        </div>

        {!isLoading && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-5 w-5" />
              <span>إنشاء الخطة</span>
            </button>
          </div>
        )}

        {isLoading && (
          <div className="mt-8 border-t border-slate-100 pt-8 animate-fade-in">
            <div className="relative flex justify-between items-center w-full max-w-3xl mx-auto mb-10">
              {/* Progress Line Background */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
              {/* Active Progress Line */}
              <div 
                className="absolute top-1/2 right-0 h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>

              {steps.map((step, idx) => {
                const isCompleted = currentStep > idx;
                const isCurrent = currentStep === idx;
                
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 bg-white px-1 sm:px-2 relative group">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
                      isCompleted 
                        ? 'border-emerald-500 bg-emerald-500 text-white scale-100' 
                        : isCurrent
                          ? 'border-emerald-500 bg-white text-emerald-600 scale-110 shadow-md ring-4 ring-emerald-50'
                          : 'border-slate-200 bg-white text-slate-300'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} className={isCurrent ? "animate-pulse" : ""} />}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-bold absolute -bottom-6 whitespace-nowrap transition-colors duration-300 ${
                      isCompleted || isCurrent ? 'text-emerald-700' : 'text-slate-300'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
            
            <div className="flex flex-col items-center justify-center text-center space-y-4 bg-emerald-50/50 p-6 rounded-xl border border-emerald-100">
               {steps[currentStep].label === 'الاستراتيجية' ? (
                 <div className="flex flex-col items-center gap-2">
                   <div className="bg-white p-3 rounded-full shadow-sm mb-1">
                      <Brain className="h-8 w-8 text-emerald-600 animate-pulse" />
                   </div>
                   <p className="text-slate-500 text-sm">
                     {selectedStrategies.length > 0 ? 'جاري دمج الاستراتيجيات المختارة...' : 'جاري اختيار استراتيجية التدريس الأمثل...'}
                   </p>
                   <p className="text-xl font-bold text-emerald-800 animate-fade-in-up min-h-[2rem]">
                     {selectedStrategies.length > 0 
                        ? activeLearningStrategies[currentStrategyIndex] || selectedStrategies[currentStrategyIndex] 
                        : activeLearningStrategies[currentStrategyIndex]}
                   </p>
                 </div>
               ) : (
                 <>
                   <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                   <p className="text-emerald-800 font-medium text-lg animate-pulse">
                     {steps[currentStep].message}
                   </p>
                 </>
               )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default InputForm;