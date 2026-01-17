import React from 'react';
import { LessonPlan, ResourceItem } from '../types';
import { 
  Clock, 
  GraduationCap, 
  Target, 
  Lightbulb, 
  ListOrdered, 
  Users, 
  User, 
  Library, 
  CheckCircle2, 
  Printer,
  FileText,
  Sparkles,
  Star,
  HeartHandshake,
  Split,
  Map as MapIcon,
  PlayCircle,
  MousePointerClick,
  Box,
  Image as ImageIcon,
  BookOpen,
  ExternalLink,
  Youtube,
  Search,
  ClipboardList,
  Check
} from 'lucide-react';

interface PlanDisplayProps {
  plan: LessonPlan;
}

const getResourceIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('خريطة')) return <MapIcon size={18} />;
  if (cat.includes('فيديو') || cat.includes('مشاهدة')) return <PlayCircle size={18} />;
  if (cat.includes('صورة')) return <ImageIcon size={18} />;
  if (cat.includes('قراءة') || cat.includes('كتاب') || cat.includes('نص')) return <BookOpen size={18} />;
  if (cat.includes('وثيقة') || cat.includes('ملف')) return <FileText size={18} />;
  if (cat.includes('تفاعلي') || cat.includes('إلكتروني') || cat.includes('موقع')) return <MousePointerClick size={18} />;
  return <Box size={18} />;
};

const getLinkTypeInfo = (url: string) => {
  if (!url) return { text: 'رابط غير متوفر', color: 'text-slate-400', bg: 'bg-slate-50', icon: <ExternalLink size={14} /> };
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('ellibrary.moe.gov.eg')) {
    return { text: 'بوابة المناهج (PDF)', color: 'text-orange-700', bg: 'bg-orange-50 hover:bg-orange-100', icon: <BookOpen size={16} /> };
  }
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return { text: 'شاهد على YouTube', color: 'text-red-700', bg: 'bg-red-50 hover:bg-red-100', icon: <Youtube size={16} /> };
  }
  if (lowerUrl.includes('wikipedia.org')) {
    return { text: 'اقرأ على ويكيبيديا', color: 'text-slate-700', bg: 'bg-slate-100 hover:bg-slate-200', icon: <BookOpen size={16} /> };
  }
  if (lowerUrl.includes('google.com/search') || lowerUrl.includes('google.com.eg')) {
    return { text: 'بحث Google', color: 'text-blue-700', bg: 'bg-blue-50 hover:bg-blue-100', icon: <Search size={16} /> };
  }
  if (lowerUrl.includes('ekb.eg')) {
    return { text: 'بنك المعرفة', color: 'text-emerald-700', bg: 'bg-emerald-50 hover:bg-emerald-100', icon: <Library size={16} /> };
  }
  
  return { text: 'زيارة الرابط', color: 'text-emerald-700', bg: 'bg-emerald-50 hover:bg-emerald-100', icon: <ExternalLink size={16} /> };
};

const groupByCategory = (items: ResourceItem[]) => {
  const grouped: Record<string, ResourceItem[]> = {};
  items.forEach(item => {
    const key = item.category.trim();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });
  return grouped;
};

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan }) => {
  const handlePrint = () => {
    // Set document title temporarily for the PDF filename
    const originalTitle = document.title;
    document.title = `${plan.title} - خطة درس`;
    window.print();
    // Restore original title
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  };

  const resourcesGrouped = groupByCategory(plan.resources);
  const additionalResourcesGrouped = plan.additionalResources ? groupByCategory(plan.additionalResources) : {};

  const renderResourceItem = (res: ResourceItem, i: number) => {
    const linkInfo = res.url ? getLinkTypeInfo(res.url) : null;
    
    return (
     <li key={i} className="bg-white/60 p-3 rounded-lg border border-purple-100/50 hover:bg-white transition-all shadow-sm hover:shadow-md print:bg-white print:shadow-none print:border-purple-100 print:break-inside-avoid">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex-grow">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                   {res.name}
                </div>
                
                {/* Print only display of URL */}
                {res.url && (
                  <div className="hidden print:block my-1 text-[10px] text-slate-600 font-mono italic break-all" dir="ltr">
                    {res.url}
                  </div>
                )}

                <div className="text-xs text-slate-500 mt-1 leading-relaxed pl-2">{res.description}</div>
            </div>
            
            {res.url && linkInfo && (
                <a 
                   href={res.url} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors no-print ${linkInfo.bg} ${linkInfo.color}`}
                   title={res.url}
                >
                    {linkInfo.icon}
                    <span>{linkInfo.text}</span>
                </a>
            )}
        </div>
     </li>
  )};

  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 no-print">
        <h3 className="text-xl font-semibold text-slate-800">الخطة الدراسية المقترحة</h3>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg px-8 py-3 rounded-xl transition-all transform hover:-translate-y-0.5 active:scale-95 font-bold text-base border-b-4 border-emerald-800 hover:border-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          title="طباعة الخطة أو حفظها كملف PDF"
          aria-label="طباعة الخطة الدراسية"
        >
          <Printer size={20} />
          <span>طباعة / حفظ PDF</span>
        </button>
      </div>

      {/* The Lesson Plan Sheet */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200 print:shadow-none print:border-none print:m-0 print:p-0 print:w-full print:rounded-none print:overflow-visible">
        
        {/* Header Strip */}
        <div className="bg-emerald-700 h-2 w-full print:bg-emerald-700 !print:bg-emerald-700"></div>

        <div className="p-8 md:p-12 font-arabic print:p-6 print:pt-4">
          
          {/* Header Info */}
          <div className="border-b-2 border-slate-100 pb-8 mb-8 print:break-inside-avoid print:pb-4 print:mb-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold mb-3 print:bg-emerald-100 print:text-emerald-800 print:border print:border-emerald-200">
                    خطة درس / Lesson Plan
                  </span>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight print:text-2xl print:text-black">
                    {plan.title}
                  </h1>
               </div>
               <div className="flex gap-4 text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100 print:bg-slate-50 print:border-slate-200 print:p-2">
                  <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-2">
                    <GraduationCap className="text-emerald-600 print:text-emerald-800" size={20} />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 print:text-slate-600">الصف</span>
                      <span className="font-semibold print:text-black">{plan.gradeLevel}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="text-emerald-600 print:text-emerald-800" size={20} />
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-400 print:text-slate-600">الزمن</span>
                      <span className="font-semibold print:text-black">{plan.estimatedTime}</span>
                    </div>
                  </div>
               </div>
             </div>
          </div>

          <div className="space-y-10 print:space-y-6">
            
            {/* Objectives */}
            <section className="print:break-inside-avoid">
              <div className="flex items-center gap-3 mb-4 text-emerald-800">
                <Target className="h-6 w-6" />
                <h2 className="text-2xl font-bold print:text-xl print:text-black">الأهداف الإجرائية / نواتج التعلم</h2>
              </div>
              <div className="bg-emerald-50/50 rounded-xl p-6 border border-emerald-100 print:bg-emerald-50 print:border-emerald-200">
                <ul className="space-y-3">
                  {plan.objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-sm font-bold mt-1 print:bg-emerald-200 print:text-emerald-800">
                        {idx + 1}
                      </span>
                      <p className="text-lg text-slate-800 leading-relaxed print:text-base print:text-black">{obj}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Hook / Introduction */}
            <section className="print:break-inside-avoid">
              <div className="flex items-center gap-3 mb-4 text-amber-600 print:text-amber-700">
                <Lightbulb className="h-6 w-6" />
                <h2 className="text-2xl font-bold print:text-xl print:text-black">التهيئة والتمهيد</h2>
              </div>
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 text-slate-800 leading-relaxed text-lg print:bg-amber-50 print:border-amber-200 print:text-base print:text-black">
                {plan.hook}
              </div>
            </section>

            {/* Lesson Sequence */}
            <section className="print:break-inside-avoid">
              <div className="flex items-center gap-3 mb-4 text-blue-700 print:text-blue-800">
                <ListOrdered className="h-6 w-6" />
                <h2 className="text-2xl font-bold print:text-xl print:text-black">عناصر الدرس والعرض</h2>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-0 overflow-hidden print:border-slate-300">
                 {plan.sequence.map((item, idx) => (
                   <div key={idx} className={`p-4 ${idx !== plan.sequence.length - 1 ? 'border-b border-slate-100' : ''} flex gap-3 hover:bg-slate-50 transition-colors print:break-inside-avoid`}>
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2.5 flex-shrink-0 print:bg-blue-600"></div>
                      <p className="text-lg text-slate-700 print:text-base print:text-black">{item}</p>
                   </div>
                 ))}
              </div>
            </section>

            {/* Activities Grid */}
            <section className="print:break-inside-avoid">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block print:space-y-4">
                {/* Individual */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:break-inside-avoid print:border-slate-300 print:shadow-none">
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-2 print:bg-slate-100 print:border-slate-200">
                    <User className="text-indigo-600 h-5 w-5 print:text-indigo-800" />
                    <h3 className="font-bold text-slate-800 text-lg print:text-black">نشاط فردي</h3>
                  </div>
                  <div className="p-6 text-slate-700 leading-relaxed print:text-base print:p-4 print:text-black">
                    {plan.activities.individual}
                  </div>
                </div>
                
                {/* Group */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:break-inside-avoid print:border-slate-300 print:shadow-none">
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center gap-2 print:bg-slate-100 print:border-slate-200">
                    <Users className="text-indigo-600 h-5 w-5 print:text-indigo-800" />
                    <h3 className="font-bold text-slate-800 text-lg print:text-black">نشاط جماعي</h3>
                  </div>
                  <div className="p-6 text-slate-700 leading-relaxed print:text-base print:p-4 print:text-black">
                    {plan.activities.group}
                  </div>
                </div>
              </div>
            </section>

            {/* Differentiation Section */}
            {plan.differentiation && (
              <section className="print:break-inside-avoid">
                <div className="flex items-center gap-3 mb-4 text-orange-700 print:text-orange-800">
                  <Split className="h-6 w-6" />
                  <h2 className="text-2xl font-bold print:text-xl print:text-black">مراعاة الفروق الفردية</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:block print:space-y-4">
                  {/* Gifted */}
                  <div className="bg-orange-50/50 rounded-xl border border-orange-200 overflow-hidden print:bg-orange-50 print:break-inside-avoid">
                    <div className="bg-orange-100/50 p-4 border-b border-orange-200 flex items-center gap-2 print:bg-orange-100">
                      <Star className="text-orange-600 h-5 w-5 print:text-orange-800" />
                      <h3 className="font-bold text-slate-800 text-lg print:text-black">الطلاب المتفوقين</h3>
                    </div>
                    <div className="p-6 text-slate-700 leading-relaxed print:text-base print:p-4 print:text-black">
                      {plan.differentiation.gifted}
                    </div>
                  </div>
                  
                  {/* Learning Difficulties */}
                  <div className="bg-teal-50/50 rounded-xl border border-teal-200 overflow-hidden print:bg-teal-50 print:break-inside-avoid">
                    <div className="bg-teal-100/50 p-4 border-b border-teal-200 flex items-center gap-2 print:bg-teal-100">
                      <HeartHandshake className="text-teal-600 h-5 w-5 print:text-teal-800" />
                      <h3 className="font-bold text-slate-800 text-lg print:text-black">ذوي صعوبات التعلم</h3>
                    </div>
                    <div className="p-6 text-slate-700 leading-relaxed print:text-base print:p-4 print:text-black">
                      {plan.differentiation.learningDifficulties}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Essential Resources Section (Full Width) */}
            <section className="print:break-inside-avoid">
              <div className="flex items-center gap-3 mb-4 text-purple-700 print:text-purple-800">
                <Library className="h-6 w-6" />
                <h2 className="text-2xl font-bold print:text-xl print:text-black">مصادر التعلم والوسائل</h2>
              </div>
              <div className="bg-purple-50 rounded-xl border border-purple-100 overflow-hidden print:bg-purple-50 print:border-purple-200">
                {Object.entries(resourcesGrouped).map(([category, items], idx) => (
                  <div key={idx} className={`${idx !== 0 ? 'border-t border-purple-200' : ''} p-5 print:p-4 print:break-inside-avoid`}>
                      <div className="flex items-center gap-2 mb-3 text-purple-700 font-bold print:text-purple-900">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm border border-purple-100 print:bg-white print:border-purple-200">
                          {getResourceIcon(category)}
                        </div>
                        <span>{category}</span>
                      </div>
                      <ul className="space-y-3">
                        {items.map((res, i) => renderResourceItem(res, i))}
                      </ul>
                  </div>
                ))}
                {Object.keys(resourcesGrouped).length === 0 && (
                  <div className="p-5 text-slate-500 text-sm text-center">لا توجد مصادر محددة</div>
                )}
              </div>
            </section>

            {/* Additional Resources Section (Full Width) */}
            {Object.keys(additionalResourcesGrouped).length > 0 && (
              <section className="print:break-inside-avoid">
                <div className="flex items-center gap-3 mb-4 text-pink-600 print:text-pink-700">
                  <Sparkles className="h-6 w-6" />
                  <h2 className="text-2xl font-bold print:text-xl print:text-black">مصادر إثرائية وإضافية</h2>
                </div>
                <div className="bg-pink-50 rounded-xl border border-pink-100 overflow-hidden print:bg-pink-50 print:border-pink-200">
                  {Object.entries(additionalResourcesGrouped).map(([category, items], idx) => (
                    <div key={idx} className={`${idx !== 0 ? 'border-t border-pink-200' : ''} p-5 print:p-4 print:break-inside-avoid`}>
                        <div className="flex items-center gap-2 mb-3 text-pink-700 font-bold print:text-pink-900">
                          <div className="bg-white p-1.5 rounded-lg shadow-sm border border-pink-100 print:bg-white print:border-pink-200">
                            {getResourceIcon(category)}
                          </div>
                          <span>{category}</span>
                        </div>
                        <ul className="space-y-3">
                          {items.map((res, i) => renderResourceItem(res, i))}
                        </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Evaluation Section (Full Width, below Resources) */}
            <section className="print:break-inside-avoid">
              <div className="flex items-center gap-3 mb-4 text-teal-700 print:text-teal-800">
                <CheckCircle2 className="h-6 w-6" />
                <h2 className="text-2xl font-bold print:text-xl print:text-black">أساليب التقويم</h2>
              </div>
              <div className="space-y-4 print:space-y-3">
                <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row gap-4 sm:items-center print:bg-white print:border-slate-300 print:break-inside-avoid">
                  <span className="text-sm font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded w-fit whitespace-nowrap print:bg-slate-200 print:text-slate-800">تقويم بنائي</span>
                  <p className="text-slate-700 print:text-base print:text-black">{plan.evaluation.formative}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row gap-4 sm:items-center print:bg-white print:border-slate-300 print:break-inside-avoid">
                  <span className="text-sm font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded w-fit whitespace-nowrap print:bg-slate-200 print:text-slate-800">تقويم واقعي</span>
                  <p className="text-slate-700 print:text-base print:text-black">{plan.evaluation.authentic}</p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row gap-4 sm:items-center print:bg-white print:border-slate-300 print:break-inside-avoid">
                  <span className="text-sm font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded w-fit whitespace-nowrap print:bg-slate-200 print:text-slate-800">تقويم ختامي</span>
                  <p className="text-slate-700 print:text-base print:text-black">{plan.evaluation.summative}</p>
                </div>

                {/* Short Quiz Section */}
                {plan.evaluation.quiz && plan.evaluation.quiz.questions.length > 0 && (
                  <div className="mt-6 pt-2 print:break-inside-avoid">
                    <div className="bg-teal-50/50 rounded-xl border border-teal-200 overflow-hidden print:bg-teal-50">
                      <div className="bg-teal-100/50 p-4 border-b border-teal-200 flex items-center gap-2 print:bg-teal-100">
                        <ClipboardList className="text-teal-600 h-5 w-5 print:text-teal-800" />
                        <h3 className="font-bold text-slate-800 text-lg print:text-black">اختبار قصير (Short Quiz)</h3>
                      </div>
                      <div className="p-6 space-y-6 print:p-4">
                        {plan.evaluation.quiz.questions.map((q, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-lg border border-slate-100 print:border-slate-200 print:bg-white">
                             <div className="flex items-start gap-3">
                               <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold mt-0.5 border border-slate-200 print:bg-slate-200 print:text-black">
                                 {idx + 1}
                               </span>
                               <div className="flex-grow">
                                  <p className="font-bold text-slate-800 mb-2 print:text-black">{q.text}</p>
                                  
                                  {/* Render Options if MCQ */}
                                  {q.options && q.options.length > 0 && (
                                    <ul className="space-y-1 pr-2 mb-3">
                                      {q.options.map((opt, i) => (
                                        <li key={i} className="flex items-center gap-2 text-slate-600 text-sm print:text-black">
                                          <div className="w-4 h-4 rounded-full border border-slate-300"></div>
                                          <span>{opt}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}

                                  {/* Answer Box */}
                                  <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1.5 rounded text-sm font-medium border border-green-100 mt-1 print:border-green-300 print:bg-green-50 print:text-black">
                                     <Check size={14} className="text-green-600 print:text-black" />
                                     <span>الإجابة الصحيحة: {q.answer}</span>
                                  </div>
                               </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

          </div>

          {/* Footer Logo/Mark */}
          <div className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-sm flex items-center justify-center gap-2 print:break-inside-avoid print:mt-8 print:pt-4">
            <FileText size={16} />
            <span>تم الإنشاء بواسطة معلم AI - مساعد المعلم الذكي</span>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default PlanDisplay;