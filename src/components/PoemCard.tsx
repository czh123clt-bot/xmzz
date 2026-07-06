import { motion } from "motion/react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { useState } from "react";
import { AnalysisResponse } from "../types";

interface PoemCardProps {
  result: AnalysisResponse;
  onReset: () => void;
}

export default function PoemCard({ result, onReset }: PoemCardProps) {
  const [copied, setCopied] = useState(false);

  const cleanQiyu = result.qiyu.replace(/[【】\[\]]/g, "");

  const handleCopy = async () => {
    try {
      const copyText = `『签语』：${cleanQiyu}\n\n『含义』：${result.hanyi}\n\n『五行』：${result.wuxing}`;
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 font-serif text-ink" id="poem-result-card">
      {/* Top title / header - No homophone keywords here */}
      <div className="text-center py-2.5 border-b border-sand relative">
        {/* Small Traditional Chinese Stamp/Seal */}
        <div className="absolute right-2 top-1.5 w-7 h-7 border border-cinnabar/80 bg-cinnabar/[0.03] flex items-center justify-center transform -rotate-12 select-none shadow-[0_0_8px_rgba(139,0,0,0.05)] pointer-events-none">
          <span className="font-serif text-[10px] font-bold text-cinnabar leading-none mt-0.5 tracking-tighter" style={{ fontFamily: '"Ma Shan Zheng", serif' }}>
            印雅
          </span>
        </div>
        <h3 className="text-lg tracking-[0.25em] font-medium text-cinnabar">
          姓名解析
        </h3>
      </div>

      {/* Main Contents styled EXACTLY like Image 1 - no scrolling, highly compact yet elegant */}
      <div className="flex-1 flex flex-col justify-center space-y-4 py-4 text-xs md:text-sm leading-relaxed text-justify px-2 overflow-hidden">
        
        {/* Sign / 签语 */}
        <div className="space-y-1">
          <div className="font-bold text-cinnabar tracking-wider text-sm">
            『签语』：
          </div>
          <p className="text-ink font-normal text-sm md:text-[15px] leading-relaxed tracking-wide">
            {cleanQiyu}
          </p>
        </div>

        {/* Meaning / 含义 */}
        <div className="space-y-1">
          <div className="font-bold text-cinnabar tracking-wider text-sm">
            『含义』：
          </div>
          <p className="text-ink font-light text-xs md:text-sm leading-relaxed">
            {result.hanyi}
          </p>
        </div>

        {/* Five Elements / 五行 */}
        <div className="space-y-1">
          <div className="font-bold text-cinnabar tracking-wider text-sm">
            『五行』：
          </div>
          <p className="text-ink font-light text-xs md:text-sm leading-relaxed">
            {result.wuxing}
          </p>
        </div>
      </div>

      {/* Action Buttons inside Card */}
      <div className="flex gap-3 pt-3 border-t border-sand">
        <button
          onClick={handleCopy}
          className={`flex-1 py-3 px-4 rounded font-light text-xs tracking-[0.25em] flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm uppercase ${
            copied
              ? "bg-emerald-700 text-white"
              : "bg-ink hover:bg-cinnabar text-white"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>复制成功</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>一键复制</span>
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="py-3 px-5 rounded border border-sand bg-transparent text-ink hover:text-cinnabar hover:border-cinnabar font-light text-xs tracking-[0.25em] flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm uppercase"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>返回</span>
        </button>
      </div>
    </div>
  );
}
