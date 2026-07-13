/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ScreenType, HealthArchive, SmartVitals } from '../types';

interface StepperScreenProps {
  healthArchive: HealthArchive;
  onUpdateArchive: (updated: Partial<HealthArchive>) => void;
  onNavigate: (screen: ScreenType) => void;
  currentStep: number;
  onSetStep: (step: number) => void;
  onAssessWithGemini: () => Promise<void>;
}

export const StepperScreen: React.FC<StepperScreenProps> = ({
  healthArchive,
  onUpdateArchive,
  onNavigate,
  currentStep,
  onSetStep,
  onAssessWithGemini,
}) => {
  const [selectedQ1, setSelectedQ1] = useState(healthArchive.answers.q1 || '经常这样，特别明显');
  const [selectedTongueType, setSelectedTongueType] = useState<string | null>(healthArchive.answers.tonguePhoto || null);
  const [ocrText, setOcrText] = useState<string | null>(healthArchive.answers.caseOcr || null);
  const [westernMeds, setWesternMeds] = useState<string[]>(healthArchive.answers.westernMeds || []);
  const [newMed, setNewMed] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [vitals, setVitals] = useState<SmartVitals>(healthArchive.vitals);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [matchedOption, setMatchedOption] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Camera & Tongue Diagnosis States
  const [capturedImage, setCapturedImage] = useState<string | null>(healthArchive.answers.tonguePhoto || null);
  const getInitialTongueDetails = () => {
    if (!healthArchive.answers.tongueAnalysis) return null;
    try {
      return JSON.parse(healthArchive.answers.tongueAnalysis);
    } catch (e) {
      return { diagnosis: healthArchive.answers.tongueAnalysis };
    }
  };
  const [tongueDetails, setTongueDetails] = useState<any>(getInitialTongueDetails());
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      // Clean up camera stream on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        try {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        } catch (e) {}
      }
    };
  }, []);

  const matchSpeechToOption = (text: string) => {
    const lowercaseText = text.toLowerCase();
    
    // Keywords for '经常这样，特别明显'
    const highKeywords = ['经常', '明显', '特别', '冰凉', '很冷', '怕冷', '非常', '太冷', '老是', '一直', '手脚凉', '手凉', '脚凉', '手足冰凉', '怕风', '喜温', '喜热', '吹风'];
    // Keywords for '偶尔会，不算严重'
    const midKeywords = ['偶尔', '一般', '有时候', '不太怕冷', '不算严重', '有的时候', '偶尔会', '一点点', '微冷', '降温', '空调', '偶尔怕冷'];
    // Keywords for '基本不觉得冷，甚至怕热'
    const lowKeywords = ['基本不', '不怕冷', '甚至怕热', '怕热', '喜凉', '正常', '不觉得冷', '不怕', '基本不', '温正常', '比较热', '好热', '容易热', '热'];

    // Count keyword matches
    let highCount = highKeywords.filter(kw => lowercaseText.includes(kw)).length;
    let midCount = midKeywords.filter(kw => lowercaseText.includes(kw)).length;
    let lowCount = lowKeywords.filter(kw => lowercaseText.includes(kw)).length;

    // Special check for strong negation of coldness
    if (lowercaseText.includes('不怕冷') || lowercaseText.includes('不觉得冷') || lowercaseText.includes('不怎么怕冷')) {
      return '基本不觉得冷，甚至怕热';
    }

    if (highCount === 0 && midCount === 0 && lowCount === 0) {
      const hasNegative = lowercaseText.includes('不') || lowercaseText.includes('没') || lowercaseText.includes('无') || lowercaseText.includes('否');
      if (hasNegative && (lowercaseText.includes('冷') || lowercaseText.includes('凉'))) {
        return '基本不觉得冷，甚至怕热';
      }
      return null;
    }

    if (highCount >= midCount && highCount >= lowCount) {
      return '经常这样，特别明显';
    } else if (midCount >= highCount && midCount >= lowCount) {
      return '偶尔会，不算严重';
    } else {
      return '基本不觉得冷，甚至怕热';
    }
  };

  const startListening = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSpeechError('您的浏览器或当前环境暂不支持 Web Speech API，请手动勾选。');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.lang = 'zh-CN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscript('');
        setSpeechError(null);
        setMatchedOption(null);
      };

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setSpeechTranscript(resultText);
        
        const matched = matchSpeechToOption(resultText);
        if (matched) {
          setSelectedQ1(matched);
          setMatchedOption(matched);
        } else {
          setMatchedOption('no_match');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        if (event.error === 'not-allowed') {
          setSpeechError('麦克风权限被拒绝，请在浏览器中允许访问麦克风。');
        } else if (event.error === 'no-speech') {
          setSpeechError('未检测到语音输入，请再次点击并清晰表达。');
        } else {
          setSpeechError(`语音识别发生错误: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e: any) {
      setSpeechError(`初始化语音识别失败: ${e.message || e}`);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setIsListening(false);
    }
  };

  const steps = [
    { id: 1, label: '体质问卷' },
    { id: 2, label: '舌诊图片' },
    { id: 3, label: '病例 OCR' },
    { id: 4, label: '西药记录' },
    { id: 5, label: '硬件体征' },
  ];

  const handleNext = async () => {
    if (currentStep < 5) {
      // Save current step data to global archive
      saveStepData();
      onSetStep(currentStep + 1);
    } else {
      // Step 5: Final Submission & Real-time assessment trigger
      setIsLoading(true);
      saveStepData();
      
      try {
        await onAssessWithGemini();
        onNavigate('ASSESSMENT_RESULTS');
      } catch (err) {
        console.error("Failed to generate results:", err);
        // Fallback navigation anyway
        onNavigate('ASSESSMENT_RESULTS');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const saveStepData = () => {
    onUpdateArchive({
      answers: {
        q1: selectedQ1,
        tonguePhoto: selectedTongueType || undefined,
        tongueAnalysis: tongueDetails ? JSON.stringify(tongueDetails) : undefined,
        caseOcr: ocrText || undefined,
        westernMeds: westernMeds,
      },
      vitals: vitals,
    });
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      onSetStep(currentStep - 1);
    } else {
      onNavigate('HOME');
    }
  };

  // Real Camera & Image upload handlers
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("未获得摄像头访问权限。您可以使用下方的「上传本地照片」功能，或者选择内置模拟舌象。");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      } catch (e) {}
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
        analyzeTonguePhoto(dataUrl);
      }
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setCapturedImage(dataUrl);
        analyzeTonguePhoto(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeTonguePhoto = async (dataUrl: string) => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/analyze-tongue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl })
      });
      if (!response.ok) {
        throw new Error('分析失败');
      }
      const data = await response.json();
      setSelectedTongueType(data.tongueType || 'fat');
      setTongueDetails(data);
    } catch (error: any) {
      console.error("Error analyzing tongue:", error);
      // fallback
      setSelectedTongueType('fat');
      setTongueDetails({
        tongueType: "fat",
        tongueColor: "淡红",
        tongueShape: "舌体胖大，两侧可见齿痕",
        coatingColor: "苔白",
        coatingType: "偏厚微腻",
        diagnosis: "脾气虚衰，水湿停运 (本地沙盒诊断模式)",
        suggestion: "建议日常温食，少油少冷，可常喝「茯苓山药大枣粥」进行食疗调理。"
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Simulate scanning tongue
  const simulateTongueScan = (type: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setSelectedTongueType(type);
      if (type === 'fat') {
        setTongueDetails({
          tongueType: "fat",
          tongueColor: "淡白",
          tongueShape: "舌体胖大，边有齿痕",
          coatingColor: "苔白",
          coatingType: "腻",
          diagnosis: "脾虚湿盛，水湿不化",
          suggestion: "建议食用黄芪、山药、薏米等，健脾利湿，忌生冷。"
        });
      } else if (type === 'red') {
        setTongueDetails({
          tongueType: "red",
          tongueColor: "红",
          tongueShape: "正常或偏瘦",
          coatingColor: "无苔或少苔",
          coatingType: "干",
          diagnosis: "阴虚内热，津液亏虚",
          suggestion: "建议食用百合、枸杞、麦冬等，滋阴清热，忌辛辣。"
        });
      } else {
        setTongueDetails({
          tongueType: "normal",
          tongueColor: "淡红",
          tongueShape: "正常",
          coatingColor: "苔白",
          coatingType: "薄",
          diagnosis: "脏腑协调，气血平和",
          suggestion: "体质基本平和。继续保持规律作息与均衡饮食。"
        });
      }
      setIsScanning(false);
    }, 1500);
  };

  // Simulate OCR scan
  const triggerOcrScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setOcrText('高血脂，冠心病待查。脾胃不和，偶有反酸腹胀。');
      setIsScanning(false);
    }, 1800);
  };

  // Sync vitals
  const triggerVitalsSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setVitals({
        heartRate: Math.floor(68 + Math.random() * 12),
        bloodOxygen: Math.floor(97 + Math.random() * 3),
        temperature: parseFloat((36.2 + Math.random() * 0.6).toFixed(1)),
      });
      setIsSyncing(false);
    }, 1200);
  };

  const addMedicine = (med: string) => {
    const m = med.trim();
    if (m && !westernMeds.includes(m)) {
      setWesternMeds([...westernMeds, m]);
    }
    setNewMed('');
  };

  const removeMedicine = (index: number) => {
    setWesternMeds(westernMeds.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen relative overflow-x-hidden pt-20 pb-32">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex flex-col items-center justify-center text-white">
          <div className="relative w-20 h-20 flex items-center justify-center mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-white/20 border-t-secondary-fixed animate-spin"></div>
            <span className="material-symbols-outlined text-[36px] text-secondary-fixed">psychology</span>
          </div>
          <h3 className="font-headline font-semibold text-[18px] mb-1">本草AI大模型诊断中</h3>
          <p className="font-sans text-[13px] text-white/70">正在智能分析面诊、舌面特征及问卷，生成专属方案...</p>
        </div>
      )}

      <main className="px-5 flex flex-col gap-6 max-w-2xl mx-auto">
        {/* Header Section */}
        <section className="mb-2">
          <h2 className="font-headline text-[22px] font-bold text-primary mb-1">完善健康档案</h2>
          <p className="font-body text-[14px] text-outline">
            请耐心完成这几步，让我们更懂你的身体状况，为你提供更精准的养生建议。
          </p>
        </section>

        {/* Stepper Navigation */}
        <section className="relative w-full overflow-hidden mb-4">
          {/* Progress Line Background */}
          <div className="absolute top-[14px] left-0 w-full h-[2px] bg-surface-container-highest -z-10"></div>
          {/* Progress Line Active */}
          <div 
            className="absolute top-[14px] left-0 h-[2px] bg-primary -z-10 transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
          ></div>
          
          <div className="flex justify-between items-start w-full no-scrollbar overflow-x-auto gap-4 pb-2">
            {steps.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div key={step.id} className="flex flex-col items-center gap-1 flex-shrink-0 w-16">
                  <button
                    onClick={() => step.id <= currentStep && onSetStep(step.id)}
                    disabled={step.id > currentStep}
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-sans text-[12px] font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-md scale-110'
                        : isCompleted
                        ? 'bg-secondary-container text-primary cursor-pointer'
                        : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed opacity-60'
                    }`}
                  >
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                    ) : (
                      step.id
                    )}
                  </button>
                  <span className={`text-[10px] text-center leading-tight font-medium font-headline ${
                    isActive ? 'text-primary font-bold' : isCompleted ? 'text-secondary font-medium' : 'text-outline'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Step Contents */}
        <section className="flex flex-col gap-6">
          {/* Step 1: Questionnaire */}
          {currentStep === 1 && (
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient border border-surface-container-low transition-all">
              <div className="flex items-start gap-2.5 mb-5">
                <span className="material-symbols-outlined text-tertiary mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>energy_savings_leaf</span>
                <div>
                  <h3 className="font-headline font-semibold text-[15px] text-on-surface leading-snug">
                    您平时怕冷吗？（即使在夏天也容易手脚冰凉）
                  </h3>
                </div>
              </div>

              {/* Integrated Intelligent Voice Answer Widget */}
              <div className="mb-5 p-4 rounded-xl bg-surface-container border border-outline-variant/60">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">mic</span>
                    <span className="font-headline text-[13px] font-bold text-on-surface">智能语音回答 (AI Voice Answer)</span>
                  </div>
                  <span className="text-[10px] text-outline font-medium">免手动选择 · 支持普通话识别</span>
                </div>

                <div className="flex items-center gap-3">
                  {isListening ? (
                    <button
                      type="button"
                      onClick={stopListening}
                      className="px-3.5 py-2 rounded-xl bg-error-container text-on-error-container hover:bg-red-200/50 font-headline text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer animate-pulse shrink-0"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                      停止聆听
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startListening}
                      className="px-3.5 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-headline text-[12px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[16px]">mic</span>
                      开始语音回答
                    </button>
                  )}

                  <div className="flex-grow min-w-0">
                    {isListening ? (
                      <p className="font-sans text-[11.5px] text-primary italic animate-pulse">
                        请清晰表达您的症状，例如：“我夏天特别怕冷，经常手脚冰凉”
                      </p>
                    ) : speechTranscript ? (
                      <div className="min-w-0">
                        <p className="font-sans text-[11.5px] text-on-surface-variant truncate">
                          识别为: <span className="font-bold text-on-surface">“{speechTranscript}”</span>
                        </p>
                        {matchedOption ? (
                          matchedOption === 'no_match' ? (
                            <p className="font-sans text-[10px] text-amber-700 font-semibold mt-0.5">
                              ⚠️ 未能匹配，请手动选择或说：“我经常怕冷”、“偶尔怕冷”、“不怕冷”
                            </p>
                          ) : (
                            <p className="font-sans text-[10px] text-emerald-700 font-bold flex items-center gap-0.5 mt-0.5">
                              <span className="material-symbols-outlined text-[12px]">check_circle</span>
                              已自动匹配勾选：{matchedOption}
                            </p>
                          )
                        ) : null}
                      </div>
                    ) : speechError ? (
                      <p className="font-sans text-[11px] text-red-600 leading-tight">
                        {speechError}
                      </p>
                    ) : (
                      <p className="font-sans text-[11.5px] text-outline leading-tight">
                        点击按钮并说话，系统将智能解析您口述的体质症状，并自动勾选下方对应选项。
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { id: 'high', val: '经常这样，特别明显', desc: '手足冰凉、怕吹风、喜温热饮品' },
                  { id: 'mid', val: '偶尔会，不算严重', desc: '仅在换季降温或长时间吹空调时感觉微冷' },
                  { id: 'low', val: '基本不觉得冷，甚至怕热', desc: '体温正常，更倾向于喜凉、喜通风' }
                ].map((opt) => (
                  <label key={opt.id} className="cursor-pointer">
                    <input 
                      type="radio" 
                      name="q1" 
                      checked={selectedQ1 === opt.val}
                      onChange={() => setSelectedQ1(opt.val)}
                      className="sr-only peer"
                    />
                    <div className="w-full p-4 rounded-xl border border-outline-variant bg-surface text-on-surface-variant transition-all hover:bg-surface-container-low peer-checked:bg-primary-container peer-checked:text-on-primary-container peer-checked:border-primary-container flex justify-between items-center group shadow-sm">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-sans text-[14px] font-semibold">{opt.val}</span>
                        <span className="font-sans text-[11px] opacity-75">{opt.desc}</span>
                      </div>
                      <span className="material-symbols-outlined hidden peer-checked:block text-primary">check_circle</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Tongue Image */}
          {currentStep === 2 && (
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient border border-surface-container-low transition-all">
              <div className="flex items-start gap-2.5 mb-4">
                <span className="material-symbols-outlined text-primary mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
                <div>
                  <h3 className="font-headline font-semibold text-[15px] text-on-surface leading-snug">
                    AI 舌诊体质辨识
                  </h3>
                  <p className="font-sans text-[11.5px] text-on-surface-variant mt-0.5">
                    中医舌诊通过舌象的变化来判断极精微的脏腑虚实。请选择摄像头拍摄、文件上传或预设模拟，体验AI多模态视觉特征检测。
                  </p>
                </div>
              </div>

              {isScanning ? (
                <div className="w-full h-56 bg-surface-container rounded-xl flex flex-col items-center justify-center relative overflow-hidden border border-dashed border-outline">
                  {/* scanning line effect */}
                  <div className="absolute left-0 w-full h-1.5 bg-emerald-500/80 shadow-[0_0_12px_rgba(16,185,129,0.8)] top-0 animate-[bounce_2s_infinite] z-10"></div>
                  <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-3"></div>
                  <p className="font-sans text-[12.5px] text-primary font-bold">本草AI视觉多模态算法智能诊断中...</p>
                  <p className="font-sans text-[10.5px] text-outline mt-1">正在基于色、形、质、苔四个维度提取中医特征</p>
                </div>
              ) : selectedTongueType && tongueDetails ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="bg-emerald-50/50 border border-emerald-200/60 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">
                    {capturedImage ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-outline-variant/60 flex-shrink-0 bg-black flex items-center justify-center">
                        <img src={capturedImage} alt="Captured Tongue" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-800">
                        <span className="material-symbols-outlined text-[36px]">featured_video</span>
                      </div>
                    )}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-1.5">
                        <span className="material-symbols-outlined text-emerald-600 text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                        <h4 className="font-headline font-bold text-[14px] text-emerald-800">舌象AI智能辨识完成</h4>
                      </div>
                      <p className="font-sans text-[11.5px] text-on-surface-variant mt-1">
                        系统已深度解析您的舌苔与舌体，已为您记录该视觉体征并与后续整体体质测评相融合。
                      </p>
                    </div>
                  </div>

                  {/* Detailed TCM Bento Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 bg-surface border border-outline-variant/60 rounded-xl text-left">
                      <span className="text-[10px] text-outline block mb-0.5">舌色 (Body Color)</span>
                      <span className="font-headline text-[13px] font-bold text-on-surface">
                        {tongueDetails.tongueColor || "淡红"}
                      </span>
                    </div>
                    <div className="p-3 bg-surface border border-outline-variant/60 rounded-xl text-left">
                      <span className="text-[10px] text-outline block mb-0.5">舌形 (Body Shape)</span>
                      <span className="font-headline text-[13px] font-bold text-on-surface">
                        {tongueDetails.tongueShape || "正常"}
                      </span>
                    </div>
                    <div className="p-3 bg-surface border border-outline-variant/60 rounded-xl text-left">
                      <span className="text-[10px] text-outline block mb-0.5">苔色 (Coating Color)</span>
                      <span className="font-headline text-[13px] font-bold text-on-surface">
                        {tongueDetails.coatingColor || "白苔"}
                      </span>
                    </div>
                    <div className="p-3 bg-surface border border-outline-variant/60 rounded-xl text-left">
                      <span className="text-[10px] text-outline block mb-0.5">苔质 (Coating Texture)</span>
                      <span className="font-headline text-[13px] font-bold text-on-surface">
                        {tongueDetails.coatingType || "薄苔"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/80 text-left">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span className="material-symbols-outlined text-primary text-[16px]">healing</span>
                      <span className="text-[12px] font-bold text-primary">中医辨证结论：{tongueDetails.diagnosis}</span>
                    </div>
                    <p className="font-sans text-[11.5px] text-on-surface-variant leading-relaxed">
                      <span className="font-bold text-on-surface">健康调理与药食建议：</span>{tongueDetails.suggestion}
                    </p>
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedTongueType(null);
                      setCapturedImage(null);
                      setTongueDetails(null);
                    }}
                    className="font-sans text-[11.5px] text-primary hover:text-primary-dim font-bold flex items-center justify-center gap-1 cursor-pointer py-1.5 bg-surface-container-high hover:bg-surface-container rounded-xl border border-outline-variant/40 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    重新评测舌象
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Option Tabs */}
                  <div className="bg-surface-container rounded-xl p-3 text-center border border-outline-variant">
                    {isCameraActive ? (
                      <div className="relative w-full rounded-lg overflow-hidden bg-black flex flex-col items-center">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-56 object-cover rounded-lg transform scale-x-[-1]" />
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 px-4">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="bg-primary text-on-primary px-4 py-2 rounded-xl font-headline text-[12px] font-bold flex items-center gap-1 shadow-md hover:bg-primary-dim cursor-pointer active:scale-95 transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                            拍摄舌象
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="bg-white/80 backdrop-blur text-gray-800 px-3 py-2 rounded-xl font-headline text-[12px] font-bold shadow-md hover:bg-white cursor-pointer active:scale-95 transition-all"
                          >
                            取消
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={startCamera}
                            className="p-4 bg-surface hover:bg-surface-container-low border border-outline-variant hover:border-primary rounded-xl flex flex-col items-center text-center gap-2 cursor-pointer transition-all active:scale-98 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[28px] text-primary">videocam</span>
                            <span className="font-headline text-[12.5px] font-bold text-on-surface">开启摄像头拍摄</span>
                            <span className="font-sans text-[10px] text-outline leading-tight">安全调用前置相机</span>
                          </button>

                          <label className="p-4 bg-surface hover:bg-surface-container-low border border-outline-variant hover:border-primary rounded-xl flex flex-col items-center text-center gap-2 cursor-pointer transition-all active:scale-98 shadow-sm relative">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageFile}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <span className="material-symbols-outlined text-[28px] text-primary">cloud_upload</span>
                            <span className="font-headline text-[12.5px] font-bold text-on-surface">上传本地照片</span>
                            <span className="font-sans text-[10px] text-outline leading-tight">支持系统相册/文件</span>
                          </label>
                        </div>

                        {cameraError && (
                          <p className="font-sans text-[10.5px] text-amber-700 leading-normal text-left px-1">
                            ⚠️ {cameraError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Preset Simulation Panel */}
                  <div className="pt-3 border-t border-surface-container-high">
                    <span className="text-[11.5px] font-bold text-outline block mb-2.5 text-left">💡 体验预设中医典型舌象 (快捷评测)</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: 'fat', label: '胖大齿痕舌', spec: '多见于脾虚湿盛' },
                        { type: 'red', label: '舌红少苔', spec: '多见于阴虚内热' },
                        { type: 'normal', label: '淡红薄白苔', spec: '平和正常舌象' }
                      ].map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => simulateTongueScan(item.type)}
                          className="p-3 bg-surface border border-outline-variant hover:border-primary rounded-xl flex flex-col items-center text-center gap-1 cursor-pointer transition-all active:scale-98 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[22px] text-tertiary">featured_video</span>
                          <span className="font-headline text-[11px] font-bold text-on-surface">{item.label}</span>
                          <span className="font-sans text-[9px] text-outline leading-tight">{item.spec}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Medical Record OCR */}
          {currentStep === 3 && (
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient border border-surface-container-low transition-all">
              <div className="flex items-start gap-2.5 mb-4">
                <span className="material-symbols-outlined text-primary mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>document_scanner</span>
                <div>
                  <h3 className="font-headline font-semibold text-[15px] text-on-surface">
                    过往病例 / 检查报告 OCR 智能扫描
                  </h3>
                  <p className="font-sans text-[11.5px] text-on-surface-variant mt-0.5">
                    扫描病例，AI 将自动分析提取病症信息，帮助交叉校验用药冲突。
                  </p>
                </div>
              </div>

              {isScanning ? (
                <div className="w-full h-44 bg-surface-container rounded-xl flex flex-col items-center justify-center border border-dashed border-outline">
                  <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
                  <p className="font-sans text-[12px] text-outline">本草AI正在提取文字并建立档案...</p>
                </div>
              ) : ocrText ? (
                <div className="flex flex-col gap-3">
                  <div className="p-4 bg-surface rounded-xl border border-outline-variant">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">AI 提取成功</span>
                      <button onClick={() => setOcrText(null)} className="text-[11px] text-outline hover:text-red-500 cursor-pointer">清除</button>
                    </div>
                    <p className="font-sans text-[13px] text-on-surface-variant leading-relaxed">
                      {ocrText}
                    </p>
                  </div>
                  <div className="bg-primary-container/20 rounded-xl p-3 border border-primary/10 flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">info</span>
                    <span className="font-sans text-[11px] text-on-primary-container leading-normal">
                      档案系统已成功记录您存在胃肠及血脂隐患，在后续推荐中会自动避开大黄、芒硝等强刺激泻下或寒凉药品。
                    </span>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={triggerOcrScan}
                  className="border-2 border-dashed border-outline-variant bg-surface hover:bg-surface-container-low rounded-xl p-8 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline">description</span>
                  </div>
                  <span className="font-headline text-[13px] font-semibold text-on-surface">一键扫描过往病历报告</span>
                  <span className="font-sans text-[10px] text-outline">支持拍取病历卡、化验单，AI 提取敏感成分</span>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Western Medicine Record */}
          {currentStep === 4 && (
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient border border-surface-container-low transition-all">
              <div className="flex items-start gap-2.5 mb-4">
                <span className="material-symbols-outlined text-primary mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>pill</span>
                <div>
                  <h3 className="font-headline font-semibold text-[15px] text-on-surface">
                    正在服用的西药记录
                  </h3>
                  <p className="font-sans text-[11.5px] text-on-surface-variant mt-0.5">
                    添加您日常正在服用的西药，AI将建立强效防范，保护您避开食药同源中潜在的配伍冲突！
                  </p>
                </div>
              </div>

              {/* Added medicine chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {westernMeds.map((med, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-error-container text-on-error-container rounded-lg font-sans text-[12px] font-medium border border-red-200"
                  >
                    <span className="material-symbols-outlined text-[14px]">medication</span>
                    {med}
                    <button 
                      type="button" 
                      onClick={() => removeMedicine(idx)}
                      className="w-4 h-4 rounded-full bg-red-600/10 flex items-center justify-center hover:bg-red-600/20 text-red-700 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[10px] font-bold">close</span>
                    </button>
                  </span>
                ))}
                {westernMeds.length === 0 && (
                  <span className="font-sans text-[12px] text-outline italic">暂无记录（添加西药后可触发冲突智能预警）</span>
                )}
              </div>

              {/* Add Input */}
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newMed}
                  onChange={(e) => setNewMed(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedicine(newMed))}
                  placeholder="手动输入西药，如：阿司匹林、华法林..."
                  className="flex-1 bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-lg px-3 py-2 text-[14px] outline-none transition-colors"
                />
                <button 
                  type="button"
                  onClick={() => addMedicine(newMed)}
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg font-headline text-[13px] font-bold hover:bg-primary-container hover:text-on-primary-container cursor-pointer transition-all active:scale-98"
                >
                  添加
                </button>
              </div>

              {/* Quick Preset buttons */}
              <div className="mt-4 pt-3 border-t border-surface-container-high">
                <span className="text-[11px] font-bold text-outline-variant block mb-2">快捷推荐西药 preset:</span>
                <div className="flex flex-wrap gap-2">
                  {['阿司匹林', '华法林', '铁剂 (硫酸亚铁)', '二甲双胍'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => addMedicine(item)}
                      className="px-2.5 py-1 bg-surface border border-outline-variant hover:border-primary rounded-md font-sans text-[11px] text-on-surface transition-colors cursor-pointer"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Hardware vitals syncing */}
          {currentStep === 5 && (
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-ambient border border-surface-container-low transition-all">
              <div className="flex items-start gap-2.5 mb-4">
                <span className="material-symbols-outlined text-primary mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>watch</span>
                <div>
                  <h3 className="font-headline font-semibold text-[15px] text-on-surface">
                    绑定智能穿戴设备同步
                  </h3>
                  <p className="font-sans text-[11.5px] text-on-surface-variant mt-0.5">
                    已连入您的 Apple Watch / 华为手环，自动同步脉搏波及体温数据。
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-xl p-4 border border-outline-variant relative overflow-hidden mb-4">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bluetooth</span>
                      <h4 className="font-headline text-[13px] text-on-surface font-semibold">健康智联蓝牙手环 V2</h4>
                    </div>
                    <span className="font-sans text-[10px] text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full bg-green-500 ${isSyncing ? 'animate-ping' : 'animate-pulse'}`}></span>
                      {isSyncing ? '同步数据中' : '设备已连接'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col items-center justify-center p-3 bg-surface-container-lowest rounded-xl border border-surface-container">
                      <span className="material-symbols-outlined text-red-500 mb-1 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      <span className="font-sans text-[16px] font-semibold text-on-surface">{vitals.heartRate}</span>
                      <span className="font-sans text-[10px] text-outline">脉率 (BPM)</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-surface-container-lowest rounded-xl border border-surface-container">
                      <span className="material-symbols-outlined text-secondary mb-1 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bloodtype</span>
                      <span className="font-sans text-[16px] font-semibold text-on-surface">{vitals.bloodOxygen}%</span>
                      <span className="font-sans text-[10px] text-outline">血氧浓度</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-surface-container-lowest rounded-xl border border-surface-container">
                      <span className="material-symbols-outlined text-tertiary-container mb-1 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>device_thermostat</span>
                      <span className="font-sans text-[16px] font-semibold text-on-surface">{vitals.temperature}°C</span>
                      <span className="font-sans text-[10px] text-outline">体温测量</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={triggerVitalsSync}
                disabled={isSyncing}
                className="w-full bg-surface-container hover:bg-surface-container-high text-primary font-headline text-[13px] py-2.5 rounded-xl border border-outline-variant flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className={`material-symbols-outlined text-[16px] ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                {isSyncing ? '同步传感器数据...' : '手动刷新传感器同步'}
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Fixed Bottom Action Area */}
      <div className="fixed bottom-0 left-0 w-full glass-panel px-5 py-4 pb-safe z-40">
        <div className="max-w-2xl mx-auto flex gap-4">
          <button 
            id="btn-stepper-back"
            onClick={handlePrev}
            className="px-5 py-3 rounded-xl bg-surface border border-outline text-on-surface font-headline text-[13px] font-semibold hover:bg-surface-container-low transition-colors cursor-pointer flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            返回
          </button>
          <button 
            id="btn-stepper-next"
            onClick={handleNext}
            className="flex-1 py-3 px-6 rounded-xl bg-primary text-on-primary font-headline text-[13px] font-semibold flex justify-center items-center gap-2 shadow-md hover:bg-primary/95 transition-all cursor-pointer active:scale-99"
          >
            {currentStep === 5 ? '提交生成 AI 评估报告' : '下一步'}
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
