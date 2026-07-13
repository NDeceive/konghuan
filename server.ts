import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    } else {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. API will run in sandbox mock mode.");
    }
  }
  return aiClient;
}

// 1. API: TCM AI Diagnosis Consultations (AI 建议 Tab)
app.post("/api/tcm-chat", async (req, res) => {
  const { messages, userProfile, healthArchive } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  const client = getAiClient();
  if (!client) {
    // Sandbox Mock Mode fallback
    const lastMsg = messages[messages.length - 1]?.content || "";
    let reply = "您好！我是本草AI助手。检测到系统运行在本地沙盒环境。对于您的提问：\"" + lastMsg + "\"，从中医的角度来看，建议您平时注重脾胃温养。您当前记录的体质倾向为“气虚夹湿”，平时易手脚冰凉，应避免西瓜、冷饮等寒凉之物。建议每日饮用‘陈皮茯苓茶’或食用‘山药薏米粥’来健脾祛湿。如有其他用药情况，请随时咨询我。";
    if (lastMsg.includes("华法林") || lastMsg.includes("人参")) {
      reply = "【安全预警】华法林是强效抗凝药，人参中含有的人参皂苷可能干扰华法林的抗凝机制，极大增加出血风险或减弱药效。因此在服用华法林期间，严格禁止自行服用人参。可以考虑使用温和、无交互风险的黄芪或冬虫夏草代替，但必须咨询主治医生意见！";
    }
    return res.json({ text: reply, isMock: true });
  }

  try {
    const systemPrompt = `你是一位精通传统中医(TCM)以及现代药理学的资深中医AI专家，名字叫“本草AI助手”。
当前正在向你咨询的消费者是：${userProfile?.name || "消费者"}。
他的体质评估记录为：
- 体质倾向：${healthArchive?.bodyType || "气虚夹湿"}
- 怕冷问卷回答：${healthArchive?.answers?.q1 || "经常怕冷，手脚冰凉"}
- 正在服用的西药：${(healthArchive?.answers?.westernMeds || []).join(", ") || "无"}
- 智能设备体征：心率 ${healthArchive?.vitals?.heartRate || 72}bpm，血氧 ${healthArchive?.vitals?.bloodOxygen || 98}%，体温 ${healthArchive?.vitals?.temperature || 36.5}℃。

请严格根据用户的输入以及中医辨证论治原则，用亲切、科学、关怀的语气提供解答：
1. 给出切实的养生、饮食调理建议（如适宜的药膳，如山药、茯苓、陈皮等）。
2. 如用户询问西药与中药、药膳、食材的配伍，务必指出潜在的“药食冲突”风险。
3. 语气保持温暖、专业，富有同理心。回复内容字数控制在250字以内，重点突出，排版整洁。`;

    const chatHistory = messages.map(m => ({
      role: m.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: m.content }]
    }));

    // Use latest message for the sendMessage call
    const lastUserMessage = messages[messages.length - 1]?.content || "你好";
    
    // Create chat
    const chat = client.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemPrompt,
      }
    });

    // Send the message
    const response = await chat.sendMessage({ message: lastUserMessage });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error in tcm-chat:", error);
    res.status(500).json({ error: error.message || "Failed to communicate with AI Assistant." });
  }
});

// 2. API: Stepper Questionnaire / Diagnostic Assessment Generative API
app.post("/api/health-assess", async (req, res) => {
  const { answers, vitals } = req.body;

  const client = getAiClient();
  if (!client) {
    // Standard mock result matching the visual design
    return res.json({
      score: answers?.q1 === "经常这样，特别明显" ? 78 : answers?.q1 === "偶尔会，不算严重" ? 85 : 92,
      bodyType: answers?.q1 === "经常这样，特别明显" ? "气虚夹湿" : answers?.q1 === "偶尔会，不算严重" ? "平和夹湿" : "阴虚内热",
      medicalAnalysis: answers?.q1 === "经常这样，特别明显" 
        ? "您的舌象显示舌体胖大有齿痕，苔白腻；结合问卷中易疲劳、身重感，AI综合判定为“气虚夹湿”。脾主运化，气虚则运化无力，水湿内停。建议健脾益气，化湿祛浊。"
        : "舌质红、苔薄。结合您偶尔怕冷的表现，AI判定您的体质大体平和，稍微夹杂少许湿气，平时多喝温水，适度锻炼即可。",
      vitalsStatus: "同步正常",
      isMock: true
    });
  }

  try {
    let tongueAnalysisDesc = "未上传舌诊照";
    if (answers?.tongueAnalysis) {
      try {
        const details = JSON.parse(answers.tongueAnalysis);
        tongueAnalysisDesc = `舌色: ${details.tongueColor || "未识别"}, 舌形: ${details.tongueShape || "未识别"}, 苔色: ${details.coatingColor || "未识别"}, 苔质: ${details.coatingType || "未识别"}。舌诊辨证: ${details.diagnosis || "无"}。建议: ${details.suggestion || "无"}。`;
      } catch (e) {
        tongueAnalysisDesc = answers.tongueAnalysis;
      }
    } else if (answers?.tonguePhoto) {
      tongueAnalysisDesc = answers.tonguePhoto === 'fat' ? '舌体胖大、边缘明显有齿痕、苔白腻' : answers.tonguePhoto === 'red' ? '舌质偏红、有津液、苔薄黄' : '舌质淡红、苔白。基本平和。';
    }

    const prompt = `根据用户的健康档案问答数据，利用中医诊断学进行分析：
用户问卷回答：
- 怕冷/手脚冰凉状况: "${answers?.q1 || "经常这样，特别明显"}"
- 舌诊图像辨识结果: "${tongueAnalysisDesc}"
- 已记录西药: "${(answers?.westernMeds || []).join(", ") || "无"}"
- 智能设备同步数据: 心率 ${vitals?.heartRate || 72} bpm, 血氧 ${vitals?.bloodOxygen || 98}%, 体温 ${vitals?.temperature || 36.5}℃。

请生成并返回一个结构化的JSON数据，包括：
1. score: 100分制综合健康评分 (数字)
2. bodyType: 体质倾向名称 (如"气虚夹湿", "阴阳平衡"等，建议在气虚夹湿、阴虚、阳虚、气郁等中医范畴)
3. medicalAnalysis: 120字以内的医理简析 (说明怕冷、脾胃、水湿运化机制，直接引用上述的舌象色、形、质特征说明，并给予具体建议)
4. vitalsStatus: 身体指标状态简评 (如"同步正常"、"略微疲劳")
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER, description: "TCM Health score from 0 to 100" },
            bodyType: { type: Type.STRING, description: "Chinese Medicine body constitution type name" },
            medicalAnalysis: { type: Type.STRING, description: "Brief herbal and metabolic explanation based on diagnosis" },
            vitalsStatus: { type: Type.STRING, description: "Brief summary of vitals" }
          },
          required: ["score", "bodyType", "medicalAnalysis", "vitalsStatus"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini API Error in health-assess:", error);
    res.status(500).json({ error: error.message || "Failed to run health assessment." });
  }
});

// 2.5. API: Tongue Image AI Diagnosis
app.post("/api/analyze-tongue", async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Image data is required." });
  }

  const client = getAiClient();
  if (!client) {
    // Sandbox Mock Mode fallback
    await new Promise(resolve => setTimeout(resolve, 1500));
    return res.json({
      tongueType: "fat",
      tongueColor: "淡红偏淡",
      tongueShape: "舌体胖大，两侧可见明显齿痕",
      coatingColor: "苔白",
      coatingType: "偏厚且腻",
      diagnosis: "脾虚水湿内停，气机受阻，运化失司",
      suggestion: "宜食用健脾温阳之品（如山药、茯苓、陈皮），少食冷饮或生冷瓜果，避开大寒之物。",
      isMock: true
    });
  }

  try {
    const match = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: "Invalid image format. Must be a valid base64 Data URL." });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const prompt = `你是一位精通传统中医(TCM)舌诊理论的舌相分析专家。请根据上传的舌头照片（舌象），从舌色、舌形、苔质、苔色四个维度进行专业的中医辨证，并给出调理建议。
请生成并返回一个结构化的JSON数据，包括：
1. tongueType: "fat" (若舌体胖大或有齿痕), "red" (若舌红少苔或无苔), 或 "normal" (淡红薄白苔)
2. tongueColor: 舌色 (例如: 淡白、淡红、红、绛)
3. tongueShape: 舌形 (例如: 胖大、有齿痕、瘦薄、有裂纹、正常)
4. coatingColor: 苔色 (例如: 白苔、黄苔、灰黑、剥脱)
5. coatingType: 苔质 (例如: 薄苔、厚腻、润燥、正常)
6. diagnosis: 中医辨证结论 (例如: 脾虚湿盛、阴虚内热、气血两虚)
7. suggestion: 针对此舌象的中医调理和生活建议 (100字以内)`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tongueType: { type: Type.STRING, description: "Must be 'fat', 'red', or 'normal'" },
            tongueColor: { type: Type.STRING, description: "Tongue body color" },
            tongueShape: { type: Type.STRING, description: "Tongue body shape" },
            coatingColor: { type: Type.STRING, description: "Coating color" },
            coatingType: { type: Type.STRING, description: "Coating thickness or texture" },
            diagnosis: { type: Type.STRING, description: "TCM Syndrome diagnosis based on tongue" },
            suggestion: { type: Type.STRING, description: "Lifestyle or herbal dietary suggestions" }
          },
          required: ["tongueType", "tongueColor", "tongueShape", "coatingColor", "coatingType", "diagnosis", "suggestion"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini API Error in analyze-tongue:", error);
    res.status(500).json({ error: error.message || "Failed to analyze tongue image." });
  }
});

// 3. API: Medicine-Food Interaction Checker
app.post("/api/risk-check", async (req, res) => {
  const { westernMed, herbalIngredient } = req.body;

  if (!westernMed || !herbalIngredient) {
    return res.status(400).json({ error: "westernMed and herbalIngredient are required." });
  }

  const client = getAiClient();
  if (!client) {
    // Custom logic mock fallback
    const isHighRisk = (westernMed.includes("华法林") || westernMed.includes("Warfarin") || westernMed.includes("阿司匹林")) && 
                       (herbalIngredient.includes("人参") || herbalIngredient.includes("丹参"));
    const isMidRisk = westernMed.includes("铁剂") && herbalIngredient.includes("茶");

    if (isHighRisk) {
      return res.json({
        riskLevel: "HIGH",
        riskLevelText: "高风险预警",
        conflictReason: `${herbalIngredient}中含有活性成分，可能干扰${westernMed}等抗血小板或抗凝药物的代谢。这种组合会显著改变药理反应，从而显著增加出血风险、消化道溃疡风险，或降低抗凝效果。`,
        safetySuggestion: `严禁同时服用。在服用${westernMed}期间，若需服用含有${herbalIngredient}的产品，请务必提前咨询您的主治医生或临床药师。`
      });
    } else if (isMidRisk) {
      return res.json({
        riskLevel: "MEDIUM",
        riskLevelText: "中风险提醒",
        conflictReason: `${herbalIngredient}中的单宁酸和鞣酸容易在消化道内与${westernMed}形成不溶性沉淀，从而显著降低${westernMed}的吸收效率，使其药效大幅度减弱。`,
        safetySuggestion: `建议间隔至少2小时服用。建议直接用温清水服用${westernMed}，也可搭配富含维生素C的橙汁以促进铁的吸收。`
      });
    } else {
      return res.json({
        riskLevel: "LOW",
        riskLevelText: "低风险提示",
        conflictReason: `在临床药理文献中，暂未发现${westernMed}与${herbalIngredient}存在明确的高风险相互作用，其性质相对平和温和。`,
        safetySuggestion: `可以适量或按日常剂量配合服用。但在服药前后半小时内仍建议以温开水为主，避免同时饮用浓茶或服用大剂量滋补品。`
      });
    }
  }

  try {
    const prompt = `分析西药「${westernMed}」与中药材/食品「${herbalIngredient}」之间的配伍禁忌和潜在药食交互风险(Drug-Food Interaction)。
请客观科学，根据医学研究及药典结论，输出包含以下字段的结构化 JSON：
1. riskLevel: 风险等级，只能是 "HIGH", "MEDIUM" 或者是 "LOW"
2. riskLevelText: 中文风险描述 (如 "高风险预警", "中风险提醒", "低风险提示")
3. conflictReason: 相互作用的药理/病理原因 (100字左右)
4. safetySuggestion: 临床及日常用药的具体安全建议 (80字左右)`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING, description: "Interaction hazard level: HIGH, MEDIUM, LOW" },
            riskLevelText: { type: Type.STRING, description: "Chinese label for danger level" },
            conflictReason: { type: Type.STRING, description: "TCM or pharmacokinetic reasons for clash" },
            safetySuggestion: { type: Type.STRING, description: "Safety action advice" }
          },
          required: ["riskLevel", "riskLevelText", "conflictReason", "safetySuggestion"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini API Error in risk-check:", error);
    res.status(500).json({ error: error.message || "Failed to perform interaction risk check." });
  }
});

// 4. API: Weekly Wellness Report Analysis
app.post("/api/weekly-report", async (req, res) => {
  const { healthArchive } = req.body;

  const client = getAiClient();
  const currentScore = healthArchive?.score || 78;
  const bodyType = healthArchive?.bodyType || "气虚夹湿";
  const isRed = bodyType.includes("阴虚") || bodyType.includes("内热");
  const diff = Math.max(5, currentScore - 65);

  const localWeeklyTrendSummary = isRed 
    ? `过去一周，您的体质健康评分呈现平稳上升态势（从一月前的65分提升至${currentScore}分）。随着调理的深入，您的阴虚内热体征得到了一定缓解，舌红少苔及口渴等阴液不足症状逐步减轻。调理机制重在滋阴清热、润燥生津。`
    : `过去一周，您的体质健康评分稳步改善（从一月前的65分提升至${currentScore}分）。随着近期温阳健脾、利湿化气调理（如坚持服用黄芪山药粥），您的气虚夹湿体质已进入稳定恢复期，畏寒和倦怠感显著减轻。`;

  const localDietAdviceSummary = isRed
    ? "本周饮食宜以清热滋阴、益胃生津为主。推荐多食百合、枸杞、银耳、山药、冬瓜等润燥降火之品。忌食辛辣温燥之物（如辣椒、花椒、牛羊肉等），避免加重体内燥热。"
    : "本周饮食宜健脾益气、温阳祛湿。推荐多吃黄芪、干山药、茯苓、生姜等温补脾胃、化气利水的食药材，可配合白萝卜消食。严格忌食冰冷、冷饮、生冷瓜果以及大寒肥腻之物。";

  const localSuggestionsList = isRed
    ? ["晚间23点前入睡以滋养阴血", "午后适量饮用麦冬枸杞代茶饮", "避免剧烈运动以防大汗伤阴"]
    : ["每晚温水泡脚20分钟以通阳散寒", "早晨空腹饮用黄芪山药温热稀粥", "避免贪凉，注意腹部与足部保暖"];

  if (!client) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return res.json({
      weeklyTrendSummary: localWeeklyTrendSummary,
      improvementLabel: `相比上月健康度提升 ${Math.round((diff / 65) * 100)}%`,
      dietAdviceTitle: isRed ? "滋阴生津，清热润燥" : "健脾温阳，化湿固表",
      dietAdviceSummary: localDietAdviceSummary,
      healthScoreDiff: diff,
      suggestionsList: localSuggestionsList,
      isMock: true
    });
  }

  try {
    const prompt = `你是一位精通传统中医(TCM)养生、食疗及健康管理的AI专家。
请根据用户的当前体质评估数据（体质类型、健康分）以及健康史趋势进行综合深度剖析，生成一份“本草养生周报”。

用户当前体质档案：
- 当前体质类型: "${bodyType}"
- 当前健康分: ${currentScore}分
- 过去4周健康史评分变化: [65分(气虚较重) -> 68分(开始调理) -> 72分(渐见成效) -> 75分(状态稳定) -> 当前${currentScore}分(${bodyType})]

请生成一个精美的JSON格式养生周报，必须严格包含以下字段：
1. weeklyTrendSummary: 一周健康变化趋势总结 (150字以内，客观描述体质好转或波动的态势，分析调理的机制成果)
2. improvementLabel: 相比上月的改善情况 (例如: "相比上月健康度提升 20%"，"体质稳步改善" 等)
3. dietAdviceTitle: 饮食建议摘要标题 (如 "健脾益气，兼顾温阳润燥")
4. dietAdviceSummary: 具体的饮食建议摘要 (150字以内，包含推荐 of 食药材组合如黄芪、山药、百合、茯苓等，以及需要忌口的食物)
5. healthScoreDiff: 相比上月提升的分数 (数字，如 ${diff})
6. suggestionsList: 3条简短的生活调理建议，以字符串数组返回 (如 ["每天温水泡脚15分钟", "早晨空腹饮用山药粥"])`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeklyTrendSummary: { type: Type.STRING },
            improvementLabel: { type: Type.STRING },
            dietAdviceTitle: { type: Type.STRING },
            dietAdviceSummary: { type: Type.STRING },
            healthScoreDiff: { type: Type.INTEGER },
            suggestionsList: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["weeklyTrendSummary", "improvementLabel", "dietAdviceTitle", "dietAdviceSummary", "healthScoreDiff", "suggestionsList"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini API Error in weekly-report:", error);
    res.json({
      weeklyTrendSummary: localWeeklyTrendSummary,
      improvementLabel: `相比上月健康度提升 ${Math.round((diff / 65) * 100)}%`,
      dietAdviceTitle: isRed ? "滋阴生津，清热润燥" : "健脾温阳，化湿固表",
      dietAdviceSummary: localDietAdviceSummary,
      healthScoreDiff: diff,
      suggestionsList: localSuggestionsList,
      isMock: true
    });
  }
});

// Setup Vite Dev server middleware or static assets for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
