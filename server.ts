import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Google Gen AI with the native GEMINI_API_KEY
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper to remove any instances of original name characters from text
function scrubOriginalChars(text: string, originalChars: string[]): string {
  let cleaned = text;
  originalChars.forEach(char => {
    // Replace with a visually elegant blank placeholder, or another homophone/elegant word
    const regex = new RegExp(char, "g");
    cleaned = cleaned.replace(regex, "〇");
  });
  return cleaned;
}

// Name analysis API route
app.post("/api/analyze", async (req, res) => {
  try {
    const { name, style = "唐风古韵", preferEngine = "Gemini" } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "请输入有效的姓名" });
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 5) {
      return res.status(400).json({ error: "支持解析2到5个字的中文姓名" });
    }

    // Basic Chinese character validation
    const isChinese = /^[\u4e00-\u9fa5]+$/.test(trimmedName);
    if (!isChinese) {
      return res.status(400).json({ error: "姓名必须全部为中文字符" });
    }

    const characters = trimmedName.split("");

    const systemInstruction = `你是一个精通中国传统命理、五行姓名学和古代诗词的国学艺术大师。
任务：根据用户输入的姓名，生成【签语】、字意【含义】与【五行分析】。

为了营造古朴典雅的国学氛围，请严格遵守以下约束：
1. 绝对禁止使用任何生僻字、僻字、繁难字、极其罕见或不常用的字词（例如：彖、爻、翥、翀、昉、烜 等字均属于生僻字，绝对不准出现）！返回的所有汉字必须是现代汉语极其常用、人人皆识、字形优美大方的常用简体汉字。
2. 绝对禁止在返回结果的任何地方（包括签语、含义、五行分析等字段的内容中）出现“谐音”、“谐意”、“同音”、“音律”、“声韵”、“化用”、“首字”、“代替”、“谐音字”、“拼音”、“声调”等任何有关“同音/读音”的解释性字眼！在用户看来，这是一份神圣尊贵的纯粹姓名解析书，任何提示谐音或读音的字眼都会破坏这种神秘高雅的传统美感。
3. 名字一共有 ${characters.length} 个字，你必须且仅能推演并选用在读音上与这 ${characters.length} 个字完全相同但字形不同、寓意优美的常用汉字作为 ${characters.length} 句诗/句子的首字。
4. 绝对禁止包含原字：在生成的推演字、签语(qiyu), 含义(hanyi), 五行分析(wuxing)中，【绝对不能出现原名字中的任何一个字 (${characters.join(", ")})】！
   - 例如，如果原名字中有“陈”字，那么选用作句首的同音字可以是“晨”、“尘”、“辰”、“臣”、“沉”等，但绝对不能是“陈”！
   - 所有句子、含义及五行分析中，也绝对不能出现原名字里的任何字。
5. 【重要：签语字数与句数限制】签语(qiyu)必须是由上述 ${characters.length} 个同音首字开头的诗句，且【必须且只能正好是 ${characters.length} 句话】（即名字是3个字，签语就必须是刚好3句诗，由标点符号隔开，绝对不准多生成第4句或少生成，必须是 1:1 对应）！整合成一段通顺优雅的辞章。不要包含任何【】、括号等包裹框，让其呈现为一句连贯、自然的古典诗篇。每句以标点隔开。
6. 含义(hanyi)是对其姓名蕴含深远美意和运势的解读。语气需要极其庄重、充满古典智慧与福泽。字数必须简练，字句精炼，【严格控制在2到4句话左右】。
7. 五行分析(wuxing)是基于姓名用字及命理进行的典雅传统五行分析。语气高雅端庄，【严格控制在2到3句话左右】。例如：“水木清华，相生相旺，意在藏锋不露。五行中和，气宇轩昂，能得四方相助。”`;

    const userPrompt = `请为姓名 "${trimmedName}" 进行深度姓名祥瑞解析。
请确保返回的内容中绝对不包含以下任何一个字符：${characters.join(", ")}。
必须严格输出符合以下结构的JSON数据。`;

    let resultJson: any = null;
    let usedEngine = "DeepSeek";

    const rawDeepSeekKey = process.env.DEEPSEEK_API_KEY || "";
    const cleanDeepSeekKey = rawDeepSeekKey.trim().replace(/[\r\n]/g, "");

    if (!cleanDeepSeekKey) {
      return res.status(400).json({ error: "未检测到 DEEPSEEK_API_KEY，请在系统设置（Secrets）中配置该密钥" });
    }

    try {
      usedEngine = "DeepSeek";
      const deepseekResponse = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cleanDeepSeekKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemInstruction },
            { 
              role: "user", 
              content: userPrompt + `\n【特别重要限制】：此次输入的姓名是 "${trimmedName}"，一共只有 ${characters.length} 个字。因此，生成的签语(qiyu)必须【有且仅有 ${characters.length} 句话】（由逗号/句号隔开），且这 ${characters.length} 句话的首字分别必须对应 ${characters.join("、")} 的同音字（拼音完全相同但字形不同且非原字）。\n【绝对禁止】生成 4 句话或者与姓名长度 (${characters.length}) 不相符的数量！请认真校对！请直接返回标准JSON字符串，例如：{"name": "...", "characters": [], "homophones": [], "pinyin": [], "qiyu": "...", "hanyi": "...", "wuxing": "..."}，不要包含 markdown 格式的包裹。`
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });

      if (!deepseekResponse.ok) {
        throw new Error(`DeepSeek API 返回状态错误: ${deepseekResponse.status}`);
      }

      const deepseekData = await deepseekResponse.json();
      const content = deepseekData.choices?.[0]?.message?.content;
      resultJson = JSON.parse(content);
    } catch (dsError: any) {
      console.error("DeepSeek API invocation failed:", dsError);
      return res.status(500).json({
        error: "DeepSeek 解析失败，请检查 API Key 配置或网络状态",
        details: dsError.message
      });
    }

    // Safety checks & post-processing to absolute ensure no original characters leak
    if (resultJson) {
      // 1. Force the original name to be what was input
      resultJson.name = trimmedName;
      resultJson.characters = characters;

      // 2. Homophones check (make sure none of them is the original character)
      resultJson.homophones = resultJson.homophones.map((h: string, idx: number) => {
        const orig = characters[idx] || "";
        if (h === orig) {
          return "〇";
        }
        return h;
      });

      // 3. Scrub sentences and overall meaning just in case of any model slip-ups
      resultJson.qiyu = scrubOriginalChars(resultJson.qiyu, characters);
      resultJson.hanyi = scrubOriginalChars(resultJson.hanyi, characters);
      resultJson.wuxing = scrubOriginalChars(resultJson.wuxing, characters);
      
      // Ensure we don't accidentally contain the words '谐音', '同音', '谐意' etc. in any field
      const banWords = [/谐音/g, /同音/g, /谐意/g, /首字/g, /拼音/g, /声调/g, /代替/g, /音律/g, /声韵/g];
      banWords.forEach(word => {
        resultJson.qiyu = resultJson.qiyu.replace(word, "字");
        resultJson.hanyi = resultJson.hanyi.replace(word, "字");
        resultJson.wuxing = resultJson.wuxing.replace(word, "字");
      });

      // Add info about which engine was used
      resultJson.engine = usedEngine;
    }

    res.json(resultJson);
  } catch (error: any) {
    console.error("Name parsing error:", error);
    res.status(500).json({
      error: "生成姓名解析失败，请稍后重试",
      details: error.message,
    });
  }
});

// Configure static and dev environments
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
