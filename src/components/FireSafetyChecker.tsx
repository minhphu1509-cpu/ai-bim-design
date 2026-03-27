import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, ArrowRight, FileText, Zap, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations, Language } from '../translations';

interface FireSafetyCheckerProps {
  language: Language;
  theme: 'light' | 'dark';
}

export const FireSafetyChecker: React.FC<FireSafetyCheckerProps> = ({ language, theme }) => {
  const t = translations[language];
  const [buildingType, setBuildingType] = useState('Chung cư');
  const [height, setHeight] = useState(25);
  const [fireResistance, setFireResistance] = useState('Bậc I');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCheck = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis based on QCVN 06:2022/BXD
    setTimeout(() => {
      const mockResults = {
        score: 85,
        categories: [
          {
            name: t.evacuationRoute,
            status: 'OK',
            details: 'Số lượng và khoảng cách lối thoát nạn tuân thủ QCVN 06:2022. Chiều rộng hành lang đạt 1.2m.',
            icon: ArrowRight
          },
          {
            name: t.fireFightingSystem,
            status: 'WARNING',
            details: 'Cần bổ sung hệ thống chữa cháy tự động Sprinkler cho khu vực hầm gửi xe theo quy định mới.',
            icon: Zap
          },
          {
            name: t.smokeControl,
            status: 'OK',
            details: 'Hệ thống hút khói hành lang và tăng áp cầu thang thiết kế đạt chuẩn.',
            icon: Flame
          },
          {
            name: t.fireSeparation,
            status: 'OK',
            details: 'Khoảng cách an toàn với các công trình lân cận đạt 6m.',
            icon: Shield
          }
        ],
        recommendations: [
          'Nâng cấp cửa ngăn cháy tại phòng kỹ thuật điện lên loại EI 60.',
          'Kiểm tra lại vị trí họng tiếp nước chữa cháy ngoài nhà, đảm bảo xe chữa cháy tiếp cận dễ dàng.',
          'Bổ sung sơ đồ chỉ dẫn thoát nạn tại mỗi tầng theo tiêu chuẩn TCVN 3890.'
        ]
      };
      setResults(mockResults);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
        theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-50 rounded-xl text-red-600">
            <Shield size={24} />
          </div>
          <div>
            <h2 className={`text-xl font-semibold transition-colors duration-300 ${
              theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
            }`}>{t.fireSafetyTitle}</h2>
            <p className="text-sm text-zinc-500">Phân tích tuân thủ dựa trên QCVN 06:2022/BXD và các tiêu chuẩn liên quan.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="space-y-2">
            <label className={`text-sm font-medium transition-colors duration-300 ${
              theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
            }`}>{t.buildingType}</label>
            <select 
              className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
              }`}
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
            >
              <option>Chung cư</option>
              <option>Văn phòng</option>
              <option>Nhà xưởng</option>
              <option>Trung tâm thương mại</option>
              <option>Trường học</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className={`text-sm font-medium transition-colors duration-300 ${
              theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
            }`}>{t.buildingHeight}</label>
            <input 
              type="number" 
              className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
              }`}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <label className={`text-sm font-medium transition-colors duration-300 ${
              theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
            }`}>{t.fireResistance}</label>
            <select 
              className={`w-full p-2.5 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${
                theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
              }`}
              value={fireResistance}
              onChange={(e) => setFireResistance(e.target.value)}
            >
              <option>Bậc I</option>
              <option>Bậc II</option>
              <option>Bậc III</option>
              <option>Bậc IV</option>
              <option>Bậc V</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleCheck}
          disabled={isAnalyzing}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Zap size={20} />
              </motion.div>
              {t.analyzing}
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              {t.checkCompliance}
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className={`p-6 rounded-2xl shadow-sm border flex flex-col items-center justify-center text-center transition-colors duration-300 ${
                theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
              }`}>
                <span className="text-sm text-zinc-500 mb-1">{t.pcccComplianceScore}</span>
                <div className="text-4xl font-bold text-red-600">{results.score}%</div>
                <div className={`w-full h-2 rounded-full mt-4 overflow-hidden ${
                  theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'
                }`}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${results.score}%` }}
                    className="bg-red-600 h-full"
                  />
                </div>
              </div>
              
              {results.categories.map((cat: any, idx: number) => (
                <div key={idx} className={`p-4 rounded-2xl shadow-sm border transition-colors duration-300 ${
                  theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg text-zinc-500 ${
                      theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'
                    }`}>
                      <cat.icon size={18} />
                    </div>
                    {cat.status === 'OK' ? (
                      <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full uppercase">Đạt</span>
                    ) : (
                      <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[10px] font-bold rounded-full uppercase">Cần sửa</span>
                    )}
                  </div>
                  <h3 className={`text-sm font-semibold mb-1 transition-colors duration-300 ${
                    theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                  }`}>{cat.name}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{cat.details}</p>
                </div>
              ))}
            </div>

            <div className={`rounded-2xl p-6 shadow-sm border transition-colors duration-300 ${
              theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                <Info size={20} className="text-blue-500" />
                <h3 className={`font-semibold transition-colors duration-300 ${
                  theme === 'dark' ? 'text-zinc-100' : 'text-zinc-900'
                }`}>{t.pcccRecommendations}</h3>
              </div>
              <ul className="space-y-3">
                {results.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className={`flex items-start gap-3 p-3 rounded-xl text-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-50 text-zinc-700'
                  }`}>
                    <div className="mt-1 p-1 bg-white rounded-full text-red-500 shadow-sm">
                      <AlertTriangle size={12} />
                    </div>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
