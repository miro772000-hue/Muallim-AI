import React from 'react';
import { LessonPlan } from '../types';
import { 
  Clock, GraduationCap, Target, Lightbulb, ListOrdered, Users, 
  User, Library, CheckCircle2, BookOpen, Brain, 
  HelpCircle, Star, Sparkles 
} from 'lucide-react';

interface PlanDisplayProps {
  plan: LessonPlan;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan }) => {
  // 🛡️ خط الدفاع الأول: لو مفيش خطة أصلاً، اعرض رسالة بدل ما تبيض الشاشة
  if (!plan) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-500">لا توجد بيانات لعرضها حالياً.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500" dir="rtl">
      
      {/* 1. رأس الخطة (العنوان والصف) */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border-r-4 border-emerald-500">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-relaxed">
          {plan.title || "عنوان الدرس"}
        </h1>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span>{plan.gradeLevel || "الصف الدراسي"}</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>{plan.estimatedTime || "45 دقيقة"}</span>
          </div>
        </div>
      </div>

      {/* 2. الأهداف (محمية من الانهيار) */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">الأهداف التعليمية</h2>
        </div>
        <ul className="space-y-4">
          {/* هنا السر: بنستخدم || [] عشان لو القائمة فاضية مايقعش */}
          {(plan.objectives || []).map((objective, idx) => (
            <li key={idx} className="flex items-start gap-3 group">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <span className="text-gray-700 leading-relaxed">{objective}</span>
            </li>
          ))}
          {(!plan.objectives || plan.objectives.length === 0) && (
            <li className="text-gray-400 italic">لا توجد أهداف مسجلة.</li>
          )}
        </ul>
      </div>

      {/* 3. النشاط الاستهلالي (Hook) */}
      <div className="bg-gradient-to-r from-purple-50 to-white rounded-2xl shadow-sm p-6 border border-purple-100">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-purple-900">التمهيد والتهيئة</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          {plan.hook || "لا يوجد نشاط تمهيدي."}
        </p>
      </div>

      {/* 4. محتوى الدرس (الشرح) */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">عناصر الدرس والشرح</h2>
        </div>
        <div className="space-y-6">
          {(plan.contentElements || []).map((item, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                {item.title}
              </h3>
              <p className="text-gray-600 leading-relaxed mr-4 border-r-2 border-indigo-200 pr-4">
                {item.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. الفروق الفردية */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
          <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold">
            <Star className="w-5 h-5" />
            <h3>للمتفوقين</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {plan.differentiation?.gifted || "لا يوجد نشاط إضافي."}
          </p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-2 mb-3 text-blue-800 font-bold">
            <HelpCircle className="w-5 h-5" />
            <h3>للدعم والمتابعة</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {plan.differentiation?.support || "لا يوجد نشاط داعم."}
          </p>
        </div>
      </div>

      {/* 6. التقويم */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-50 rounded-lg">
            <ListOrdered className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">التقويم والواجبات</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-gray-700 mb-2 border-b pb-2">التقويم التكويني (أثناء الحصة)</h4>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">
              {plan.assessment?.formative || "لا يوجد."}
            </p>
          </div>
          <div>
            <h4 className="font-bold text-gray-700 mb-2 border-b pb-2">التقويم الختامي (الواجب)</h4>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">
              {plan.assessment?.summative || "لا يوجد."}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PlanDisplay;
