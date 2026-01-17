import React from 'react';
import { BookOpen, Globe2 } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 no-print">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
          
          {/* Main Content Column (Right Aligned in RTL) */}
          <div className="flex flex-col items-center md:items-start text-center md:text-right space-y-4 flex-grow">
            
            {/* 1. Animated Globe Image Above Title */}
            <div className="relative">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-emerald-50 shadow-lg bg-slate-900">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif" 
                  alt="كرة أرضية متحركة"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1.5 rounded-full border-2 border-white">
                <Globe2 size={16} />
              </div>
            </div>

            {/* 2. Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight flex flex-col md:flex-row items-center gap-2">
              <span>Muallim AI</span>
              <span className="hidden md:inline text-slate-300 font-light">|</span>
              <span className="text-emerald-700">مساعد المعلم الذكي</span>
            </h1>

            {/* 3. Quote */}
            <div className="bg-emerald-50/80 px-4 py-2 rounded-r-lg border-r-4 border-emerald-500 inline-block">
              <p className="text-emerald-800 font-medium text-lg italic flex items-center gap-2">
                <span>"أنت مصدر إلهام لطلابك"</span>
              </p>
            </div>

            {/* 4. Name & Title */}
            <div className="flex flex-col gap-1 text-slate-600 pt-1">
               <div className="flex items-center justify-center md:justify-start gap-2">
                 <div className="h-1 w-1 rounded-full bg-slate-400"></div>
                 <h2 className="font-bold text-slate-800 text-base md:text-lg">أ.د / مروى حسين اسماعيل</h2>
               </div>
               <p className="text-sm md:text-base pr-3">أستاذ المناهج وطرق التدريس - كلية التربية - جامعة عين شمس</p>
            </div>
          </div>

          {/* Left Side Decoration/Badge (Hidden on small screens to focus on main content) */}
          <div className="hidden md:flex flex-col items-end pt-4">
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3 mb-4">
               <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
                 <BookOpen size={20} />
               </div>
               <div className="text-right">
                 <div className="text-xs text-slate-500 font-bold">مصمم تعليمي ذكي</div>
                 <div className="text-[10px] text-slate-400">Smart Instructional Designer</div>
               </div>
             </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;