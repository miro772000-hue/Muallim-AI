import React, { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import PlanDisplay from './components/PlanDisplay';
import { generateLessonPlan } from './services/geminiService';
import { LessonPlan, GenerationStatus } from './types';
import { AlertCircle, Compass, ScrollText } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async (topic: string, grade: string, subject: string, strategies: string[] = [], contentElements: string[] = []) => {
    setStatus('loading');
    setErrorMsg(null);
    setLessonPlan(null);

    try {
      const plan = await generateLessonPlan(topic, grade, subject, strategies, contentElements);
      setLessonPlan(plan);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMsg("لم نتمكن من إنشاء خطة الدرس. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.");
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Hero Section */}
        <div className="relative w-full overflow-hidden rounded-2xl bg-slate-900 mb-8 shadow-sm border border-slate-200 no-print group">
           {/* Background Image - Vintage Map/Globe/Study feel */}
           <img 
             src="https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=2103&auto=format&fit=crop" 
             alt="Social Studies Tools" 
             className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-25 group-hover:scale-105 transition-all duration-1000"
           />
           
           {/* Gradient Overlay */}
           <div className="absolute inset-0 bg-gradient-to-l from-slate-900/10 via-slate-900/60 to-slate-900/90"></div>

           <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-right max-w-2xl">
                 <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-emerald-400 text-xs font-bold mb-4 backdrop-blur-sm">
                    <Compass size={14} />
                    <span>مساحتك للإبداع التربوي</span>
                 </div>
                 <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    أنت تصنع المستقبل... <br />
                    <span className="text-emerald-400">ونحن نساعدك في التخطيط له.</span>
                 </h2>
                 <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
                    حول شغفك بالتدريس إلى دروس تفاعلية مُلهمة. أدوات ذكية تضع العالم بين يدي طلابك، وتمنحك الوقت لتكون القدوة التي يحتاجونها.
                 </p>
              </div>
              
              {/* Visual Icon Graphic */}
              <div className="hidden md:flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                 <ScrollText size={48} className="text-emerald-400 mb-2" />
                 <span className="text-slate-300 text-sm font-medium">خطط دراسية متكاملة</span>
              </div>
           </div>
        </div>

        <InputForm onGenerate={handleGenerate} isLoading={status === 'loading'} />

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3 text-red-700 animate-pulse">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {status === 'success' && lessonPlan && (
          <PlanDisplay plan={lessonPlan} />
        )}
        
        {/* Empty State / Welcome (Hidden when we have the Hero section to avoid redundancy, or kept minimal) */}
        {status === 'idle' && (
          <div className="text-center py-8 px-4 opacity-50">
             <p className="text-slate-400 text-sm">
               مدعوم بأحدث تقنيات الذكاء الاصطناعي لتطوير التعليم المصري
             </p>
          </div>
        )}

      </main>

      {/* Footer / Credits */}
      <footer className="w-full py-8 mt-auto border-t border-slate-200 bg-white/50 text-center no-print">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center justify-center space-y-2">
           <div className="bg-emerald-50 text-emerald-700 px-3 py-0.5 rounded-full text-xs font-bold border border-emerald-100 inline-block mb-1">
             إشراف وتنفيذ
           </div>
           <h3 className="font-bold text-slate-800 text-lg md:text-xl">
             أ.د / مروى حسين اسماعيل
           </h3>
           <p className="text-slate-600 font-medium text-sm md:text-base">
             أستاذ المناهج وطرق التدريس - كلية التربية - جامعة عين شمس
           </p>
        </div>
      </footer>
    </div>
  );
};

export default App;