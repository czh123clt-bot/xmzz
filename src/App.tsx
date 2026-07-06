import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  PenTool, 
  AlertCircle,
  RefreshCw
} from "lucide-react";
import PoemCard from "./components/PoemCard";
import { AnalysisResponse } from "./types";

const ROTATING_MESSAGES = [
  "正在请执笔先生铺展宣纸...",
  "研磨微香，文墨交融中...",
  "参悟名讳字意，探寻命理玄机...",
  "字字玑珠，正在为您编撰姓名解析...",
  "挥毫落笔，墨香氤氲，解析即成..."
];

export default function App() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [screen, setScreen] = useState<"input" | "loading" | "result">("input");

  // Rotating loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % ROTATING_MESSAGES.length);
      }, 2500);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const validateName = (val: string): boolean => {
    const trimmed = val.trim();
    if (trimmed.length < 2 || trimmed.length > 5) return false;
    return /^[\u4e00-\u9fa5]+$/.test(trimmed);
  };

  const handleAnalyze = async () => {
    const trimmed = name.trim();
    if (!validateName(trimmed)) {
      setError("请输入2-5个汉字的有效中文姓名");
      return;
    }

    setError(null);
    setLoading(true);
    setScreen("loading");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        throw new Error(`服务器响应格式错误 (HTTP ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(data?.error || `生成解析失败 (HTTP ${response.status})`);
      }

      setResult(data);
      setScreen("result");
    } catch (err: any) {
      console.error("解析姓名出错:", err);
      setError(err.message || "连接服务器失败，请稍后重试");
      setScreen("input");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName("");
    setResult(null);
    setError(null);
    setScreen("input");
  };

  return (
    <div className="h-screen w-screen bg-paper text-ink font-sans flex items-center justify-center overflow-hidden p-4 relative select-none">
      {/* Visual Dot Background Overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none paper-dots z-0" />
      
      {/* Main Height-Constrained Elegant Panel */}
      <div className="w-full max-w-md h-full max-h-[520px] bg-ivory border border-sand shadow-[0_20px_50px_rgba(139,0,0,0.06)] relative flex flex-col justify-between p-6 z-10 rounded-lg">
        
        {/* Inner thin frame (traditional Chinese book layout) */}
        <div className="absolute inset-2 border border-sand/40 pointer-events-none z-0 rounded-md" />
        <div className="absolute inset-3.5 border border-cinnabar/10 pointer-events-none z-0 rounded" />

        {/* Traditional Chinese cloud/auspicious corner details */}
        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-cinnabar/30 pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-cinnabar/30 pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-cinnabar/30 pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-cinnabar/30 pointer-events-none" />

        {/* Decorative corner borders */}
        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#8B0000]/20 pointer-events-none" />
        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#8B0000]/20 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#8B0000]/20 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#8B0000]/20 pointer-events-none" />

        <AnimatePresence mode="wait">
          {screen === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col justify-between"
            >
              {/* Header */}
              <header className="text-center pt-4 flex flex-col items-center relative">
                {/* Traditional Chinese Red Seal/Stamp Badge */}
                <div className="absolute right-4 top-2 w-8 h-8 border border-cinnabar/80 bg-cinnabar/[0.03] flex items-center justify-center transform rotate-6 select-none shadow-[0_0_10px_rgba(139,0,0,0.05)] pointer-events-none">
                  <span className="font-serif text-[11px] font-bold text-cinnabar leading-none mt-0.5 tracking-tighter" style={{ fontFamily: '"Ma Shan Zheng", serif' }}>
                    吉呈
                  </span>
                </div>

                <div className="w-10 h-10 border-2 border-cinnabar flex items-center justify-center mb-2.5 shadow-sm transform hover:rotate-12 transition-transform duration-300">
                  <span className="font-serif text-lg font-bold text-cinnabar leading-none mt-0.5">名</span>
                </div>
                
                <h1 className="text-2xl font-serif font-medium text-ink tracking-[0.2em]">
                  姓名解析
                </h1>
                <p className="text-[9px] text-cinnabar font-serif tracking-[0.3em] uppercase mt-1">
                  Traditional Name Analysis
                </p>
              </header>

              {/* Classical Ornamental Divider & Motto */}
              <div className="my-4 flex flex-col items-center justify-center space-y-3.5 select-none pointer-events-none">
                {/* Elegant Traditional Pattern Divider */}
                <div className="flex items-center justify-center gap-2 w-full max-w-[200px]">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-cinnabar/20" />
                  <span className="text-cinnabar/30 text-[8px]">❖</span>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-cinnabar/20" />
                </div>
                
                <div className="flex justify-center gap-6 text-[11px] font-serif text-ink/50 tracking-[0.35em]">
                  <div className="flex flex-col items-center">
                    <span className="mb-1">名承吉兆</span>
                    <span>字启祥瑞</span>
                  </div>
                  <div className="w-[1px] h-6 bg-sand/60 self-center" />
                  <div className="flex flex-col items-center">
                    <span className="mb-1">一笔藏墨</span>
                    <span>一画蕴乾</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 w-full max-w-[200px]">
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-cinnabar/20" />
                  <span className="text-cinnabar/30 text-[8px]">❖</span>
                  <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-cinnabar/20" />
                </div>
              </div>

              {/* Input Form Center */}
              <div className="my-auto space-y-5">
                <div className="space-y-3">
                  <label className="block text-xs text-cinnabar text-center uppercase tracking-widest font-serif font-bold">
                    观众姓名（支持 2 至 5 个汉字）
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={5}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError(null);
                      }}
                      placeholder="请输入您的姓名"
                      className="w-full bg-[#FEFDFB] border-2 border-cinnabar/40 hover:border-cinnabar/60 rounded-md py-4 px-3 text-center text-xl font-serif focus:outline-none focus:border-cinnabar focus:ring-1 focus:ring-cinnabar transition-all placeholder:text-ink/30 placeholder:text-base placeholder:font-sans placeholder:tracking-normal text-ink shadow-sm"
                    />
                    
                    {name && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-cinnabar font-mono font-bold">
                        {name.length} 字
                      </span>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded text-[11px] text-rose-800 flex items-center justify-center gap-1.5 font-sans">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pb-4">
                <button
                  type="button"
                  disabled={!validateName(name)}
                  onClick={handleAnalyze}
                  className="w-full bg-ink hover:bg-cinnabar disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-serif tracking-[0.3em] text-xs py-3.5 px-4 rounded-none shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 uppercase"
                >
                  <PenTool className="w-4 h-4" />
                  <span>点击解析 • ANALYZE</span>
                </button>
              </div>
            </motion.div>
          )}

          {screen === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center space-y-6"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-sand border-t-cinnabar animate-spin" />
                <div className="absolute inset-2 bg-ivory rounded-full flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-cinnabar" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="font-serif text-sm font-semibold text-ink tracking-widest">
                  执笔落字中
                </p>
                <motion.p
                  key={loadingMsgIdx}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-xs text-ink/60 font-serif italic tracking-wider h-4"
                >
                  {ROTATING_MESSAGES[loadingMsgIdx]}
                </motion.p>
              </div>
            </motion.div>
          )}

          {screen === "result" && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col h-full"
            >
              <PoemCard result={result} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
