/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenType, UserProfile, HealthArchive } from '../types';

interface HomeScreenProps {
  userProfile: UserProfile;
  healthArchive: HealthArchive;
  onNavigate: (screen: ScreenType) => void;
  onSetStepperStep: (step: number) => void;
  onSelectRecipeById: (id: string) => void;
  onSelectProductById: (id: string) => void;
}

interface WeeklyReportData {
  weeklyTrendSummary: string;
  improvementLabel: string;
  dietAdviceTitle: string;
  dietAdviceSummary: string;
  healthScoreDiff: number;
  suggestionsList: string[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  healthArchive,
  onNavigate,
  onSetStepperStep,
  onSelectRecipeById,
  onSelectProductById,
}) => {
  // Navigation & Modals
  const [showHerbScanModal, setShowHerbScanModal] = useState<boolean>(false);
  const [showExerciseModal, setShowExerciseModal] = useState<boolean>(false);

  // States for TCM Herb Scanner
  const [selectedHerbToScan, setSelectedHerbToScan] = useState<string | null>(null);
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any | null>(null);

  // States for Exercise Video Player
  const [playingVideo, setPlayingVideo] = useState<any | null>(null);
  const [videoPlayTime, setVideoPlayTime] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  // Mock TCM Herbs for Scanning
  const HERB_PRESETS = [
    {
      id: 'ginseng',
      name: '长白山野山参 (特级生晒参)',
      image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=400',
      authentic: true,
      rating: '真品 · 优等道地 (A级)',
      score: '98分',
      features: [
        { label: '芦头特征', desc: '芦碗紧密，雁脖芦特征极其明显，完好无损', isMatch: true },
        { label: '参皮颜色', desc: '皮色老黄，质地坚实，表面横纹细密深邃，肩部横纹黑如铁线', isMatch: true },
        { label: '气味辨识', desc: '香气极其浓郁，带天然参香味，入口微苦后甘甜极其持久', isMatch: true },
        { label: '硫磺熏蒸', desc: '未检出任何二氧化硫化学残留 (天然安全级别)', isMatch: true },
      ],
      description: '此样品参体形态自然完美，主根苍劲结实，雁脖芦纤长，横纹紧紧围绕参肩。经AI物理外观和多维气味成分传感器解析，判定为特级长白山道地生晒野山参。具有极佳的补气固脱、健脾益肺、强心安神药效。日常炖汤或泡水皆宜。',
    },
    {
      id: 'cordyceps',
      name: '西藏那曲野生冬虫夏草',
      image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=400',
      authentic: true,
      rating: '真品 · 野生道地 (特级)',
      score: '96分',
      features: [
        { label: '虫体环纹', desc: '色泽黄净，背部环纹12对极明显，腹部足8对完好清晰', isMatch: true },
        { label: '子座外观', desc: '呈深褐色，头部微鼓，粗细均匀，长度与虫体接近', isMatch: true },
        { label: '质地气味', desc: '质地饱满挺拔，带特有草菇香与浓郁腥香混合气味', isMatch: true },
        { label: '掺重物质', desc: '未检出任何竹签、铁丝或泥沙等异常增重掺假', isMatch: true },
      ],
      description: '样品色泽金黄饱满，环纹清晰匀称，子座与虫体生长过渡极其自然。经AI多维三维轮廓检测与重金属/残留快速测试，确认为纯正西藏那曲野生冬虫夏草。其补肺益肾、秘精益气、调节免疫效力十分充沛。',
    },
    {
      id: 'goji_sulfur',
      name: '普通商超售卖枸杞子',
      image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=400',
      authentic: false,
      rating: '警示 · 疑似工业硫磺重度熏蒸',
      score: '42分',
      features: [
        { label: '外观色泽', desc: '异常鲜红夺目，表皮极其红亮、无天然果胶油脂白点', isMatch: false },
        { label: '气味辨识', desc: '香气寡淡无味，凑近闻伴有明显的刺鼻二氧化硫酸味', isMatch: false },
        { label: '果水反应', desc: '果粒粘连潮湿，泡水后水体迅速变红，且呈酸性反应', isMatch: false },
        { label: '熏硫残留', desc: '高浓度超标检测：二氧化硫残留量达 450mg/kg (超标严重)', isMatch: false },
      ],
      description: '⚠️ 预警提示：该枸杞子颜色异常鲜红，且无天然白点。经AI光谱吸收特征检测，确认其表皮二氧化硫残留量严重超标，属于工业硫磺重度熏蒸后的劣质产品（通常为了增色和防霉）。二氧化硫残留极易刺激胃肠粘膜，长期服用损伤肝肾、耗伤元气，强烈建议禁止食用！',
    },
  ];

  // Mock Recommended Exercises
  const EXERCISE_VIDEOS = [
    {
      id: 'baduanjin',
      name: '八段锦 · 调理脾胃须单托',
      cover: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=400',
      duration: '03:45',
      category: '健脾化湿 · 疏肝理气',
      targetConstitutions: ['气虚夹湿', '平和夹湿'],
      steps: [
        '【准备势】两脚平开，双臂下垂，平心静气，呼吸自然。',
        '【吸气托天】左掌缓缓翻转向上，五指朝右，托至头顶上方；右掌翻转向下按至右股旁，两力形成对拉。',
        '【呼气还原】左掌慢慢放松，沿体前落下，右手同时收回，两手恢复合于腹前。',
        '【意念心法】意在中脘（胃部）。一上一下，如对拉拉簧，调理中焦脾土，使清阳之气上升，浊阴之气下降。',
      ],
    },
    {
      id: 'taichi',
      name: '太极拳 · 起势与左右野马分鬃',
      cover: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=400',
      duration: '04:20',
      category: '调和阴阳 · 经络通畅',
      targetConstitutions: ['阴虚内热', '平和夹湿'],
      steps: [
        '【太极起势】两脚开立，两臂徐徐前平举，与肩同高，吸气；屈膝下蹲，两掌下按，呼气。',
        '【抱球收脚】身体微右转，双手合抱如球状，右脚微屈，左脚收置于右脚内侧。',
        '【野马分鬃】左脚向左前方迈出成左弓步，双手一上一下随腰转动向外分掤，目视左掌。',
        '【意念心法】含胸拔背，意守丹田。气沉周身，以心行气，以气运身，动作连绵不断，调和阴阳。',
      ],
    },
    {
      id: 'yinjinjing',
      name: '易筋经 · 韦驮献杵第一势',
      cover: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=400',
      duration: '02:50',
      category: '培元固本 · 强筋健骨',
      targetConstitutions: ['气虚夹湿', '阴虚内热'],
      steps: [
        '【立定聚气】两脚平开，宽与肩齐。两手缓缓自左右上提，掌心向上，微屈肘。',
        '【当胸合十】两手收回至胸前合十，指尖向上，吸气，舌抵上腭。',
        '【定力冥想】闭目凝神，呼气时全身放松，但手臂合十之力保持均匀，躯干挺直。',
        '【意念心法】气海充盈，神气内守。此势主在培元，借由吐纳深呼吸将天地纯阳之气归于丹田。',
      ],
    },
  ];

  // Timer to drive the breathing exercise synchronizer
  useEffect(() => {
    let interval: any = null;
    if (isVideoPlaying && playingVideo) {
      interval = setInterval(() => {
        setVideoPlayTime((prev) => {
          if (prev >= 60) {
            return 0; // Loop or restart
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isVideoPlaying, playingVideo]);

  const handleStartScan = (herbId: string) => {
    const herb = HERB_PRESETS.find((h) => h.id === herbId);
    if (!herb) return;

    setSelectedHerbToScan(herbId);
    setScanImage(herb.image);
    setIsScanning(true);
    setScanResult(null);

    // Simulate scanning analysis progress
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(herb);
    }, 2500);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setScanImage(reader.result as string);
        setIsScanning(true);
        setScanResult(null);

        // Select goji_sulfur or random results for uploaded image
        setTimeout(() => {
          setIsScanning(false);
          setScanResult(HERB_PRESETS[2]); // Default warning for custom upload for warning education
        }, 2500);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentStepIndex = () => {
    if (!playingVideo) return 0;
    const numSteps = playingVideo.steps.length;
    // Switch instruction guide every 4 seconds
    return Math.floor(videoPlayTime / 4) % numSteps;
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return '早安';
    if (hours < 18) return '下午好';
    return '晚安';
  };

  const handleQuickEntry = (stepNumber: number) => {
    onSetStepperStep(stepNumber);
    onNavigate('STEPPER');
  };

  const handleViewSoupRecipe = () => {
    onSelectRecipeById('soup');
    onNavigate('DIET_DETAIL');
  };

  const handleViewTraceability = () => {
    onSelectProductById('yanshen'); // Longbai Mountain Ginseng
    onNavigate('PRODUCT_DETAIL');
  };

  // Check if western medicines contain "华法林" or "阿司匹林" to show custom conflicts
  const hasAspirin = healthArchive.answers.westernMeds.includes('阿司匹林');
  const hasWarfarin = healthArchive.answers.westernMeds.includes('华法林');

  return (
    <main className="px-5 max-w-lg mx-auto md:max-w-4xl pt-20 pb-28">
      {/* Greeting & Date */}
      <section className="mb-6 pt-2">
        <h2 className="font-headline font-bold text-[32px] text-primary mb-1">
          {getGreeting()}，{userProfile.name}
        </h2>
        <div className="font-body text-[15px] text-on-surface-variant flex justify-between items-center">
          <span>今天适合温和调理</span>
          <span className="font-sans text-[11px] bg-surface-container-high px-2.5 py-1 rounded-full text-on-surface-variant border border-surface-container-highest">
            10月24日 甲辰年
          </span>
        </div>
      </section>

      {/* Health Progress Card */}
      <section className="mb-6">
        <div className="bg-surface-container-lowest rounded-2xl p-4 ambient-shadow border border-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path 
                  className="text-surface-variant" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3.5"
                ></path>
                <path 
                  className="text-primary" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeDasharray="70, 100" 
                  strokeWidth="3.5"
                ></path>
              </svg>
              <span className="absolute font-sans text-[13px] text-primary font-bold">70%</span>
            </div>
            <div>
              <h3 className="font-headline text-[14px] text-on-surface font-bold">健康档案进度</h3>
              <p className="font-sans text-[11px] text-on-surface-variant">完善信息获取更准建议</p>
            </div>
          </div>
          <button 
            id="btn-perfect-record"
            onClick={() => handleQuickEntry(1)}
            className="font-sans text-[12px] text-primary bg-secondary-container hover:bg-secondary-fixed/50 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
          >
            去完善
          </button>
        </div>
      </section>

      {/* Main AI Health Assessment Card */}
      <section className="mb-6 relative overflow-hidden rounded-2xl bg-primary-container text-on-primary-container ambient-shadow p-6">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="bg-secondary-container text-on-secondary-container font-sans text-[11px] px-2.5 py-1 rounded-full inline-block mb-3 font-semibold border border-secondary-fixed-dim/20">
                智能健康评估
              </span>
              <h3 className="font-headline text-[20px] font-bold mb-1">全面体质分析</h3>
              <p className="font-body text-[14px] text-on-primary-container opacity-90 leading-relaxed max-w-[85%]">
                基于您的最新数据，AI正在为您生成专属中医调理方案。
              </p>
            </div>
            <span className="material-symbols-outlined text-4xl text-secondary-fixed opacity-95">health_metrics</span>
          </div>
          <button 
            id="btn-start-assess"
            onClick={() => handleQuickEntry(1)}
            className="w-full bg-secondary text-on-secondary font-headline text-[14px] py-3 rounded-xl hover:bg-secondary-fixed hover:text-on-secondary-fixed-variant transition-all flex items-center justify-center gap-1.5 font-bold cursor-pointer shadow-md active:scale-99"
          >
            开始评估 <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        {/* Decorative wave/pulse graphic */}
        <div className="absolute bottom-0 right-0 w-full h-1/2 opacity-25 pointer-events-none" style={{ background: "radial-gradient(circle at 100% 100%, #cee9d3 0%, transparent 60%)" }}></div>
      </section>

      {/* 5-Column Quick Entry Row (体质问卷 + 舌诊上传 + 病例 OCR + 西药记录 + 硬件体征) */}
      <section className="mb-6 grid grid-cols-5 gap-2">
        <div 
          id="entry-quiz"
          onClick={() => handleQuickEntry(1)}
          className="bg-surface-container-lowest rounded-xl p-2 flex flex-col items-center justify-center text-center gap-1.5 hover:bg-surface-container-low border border-surface-container-low shadow-sm hover:border-primary/40 transition-all cursor-pointer group active:scale-95 min-h-[96px]"
        >
          <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200/50 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">quiz</span>
          </div>
          <span className="font-headline text-[10.5px] font-bold text-on-surface line-clamp-1">体质问卷</span>
        </div>

        <div 
          id="entry-tongue"
          onClick={() => handleQuickEntry(2)}
          className="bg-surface-container-lowest rounded-xl p-2 flex flex-col items-center justify-center text-center gap-1.5 hover:bg-surface-container-low border border-surface-container-low shadow-sm hover:border-primary/40 transition-all cursor-pointer group active:scale-95 min-h-[96px]"
        >
          <div className="w-9 h-9 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed-variant shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
          </div>
          <span className="font-headline text-[10.5px] font-bold text-on-surface line-clamp-1">舌诊上传</span>
        </div>

        <div 
          id="entry-ocr"
          onClick={() => handleQuickEntry(3)}
          className="bg-surface-container-lowest rounded-xl p-2 flex flex-col items-center justify-center text-center gap-1.5 hover:bg-surface-container-low border border-surface-container-low shadow-sm hover:border-primary/40 transition-all cursor-pointer group active:scale-95 min-h-[96px]"
        >
          <div className="w-9 h-9 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed-variant shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">document_scanner</span>
          </div>
          <span className="font-headline text-[10.5px] font-bold text-on-surface line-clamp-1">病例 OCR</span>
        </div>

        <div 
          id="entry-medicine"
          onClick={() => handleQuickEntry(4)}
          className="bg-surface-container-lowest rounded-xl p-2 flex flex-col items-center justify-center text-center gap-1.5 hover:bg-surface-container-low border border-surface-container-low shadow-sm hover:border-primary/40 transition-all cursor-pointer group active:scale-95 min-h-[96px]"
        >
          <div className="w-9 h-9 rounded-full bg-error-container flex items-center justify-center text-on-error-container shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">pill</span>
          </div>
          <span className="font-headline text-[10.5px] font-bold text-on-surface line-clamp-1">西药记录</span>
        </div>

        <div 
          id="entry-vitals"
          onClick={() => handleQuickEntry(5)}
          className="bg-surface-container-lowest rounded-xl p-2 flex flex-col items-center justify-center text-center gap-1.5 hover:bg-surface-container-low border border-surface-container-low shadow-sm hover:border-primary/40 transition-all cursor-pointer group active:scale-95 min-h-[96px]"
        >
          <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">watch</span>
          </div>
          <span className="font-headline text-[10.5px] font-bold text-on-surface line-clamp-1">硬件体征</span>
        </div>
      </section>

      {/* 中药材拍照识别真假 & 运动视频推荐 Grid */}
      <section className="mb-8 grid grid-cols-2 gap-4">
        {/* Left: TCM Herb Photo Identification */}
        <div 
          onClick={() => {
            setShowHerbScanModal(true);
            // Reset scan state when opening
            setSelectedHerbToScan(null);
            setScanImage(null);
            setIsScanning(false);
            setScanResult(null);
          }}
          className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm hover:border-primary/40 hover:bg-surface-container-low/20 transition-all cursor-pointer flex flex-col justify-between min-h-[190px] relative overflow-hidden group active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-300"></div>
          <div>
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>camera_enhance</span>
            </div>
            <h3 className="font-headline font-bold text-[15px] text-on-surface">药材拍照鉴真</h3>
            <p className="font-sans text-[11.5px] text-outline mt-1.5 leading-relaxed">
              AI 智能识别真假中药材，深度辨析横纹、芦头及熏硫残留。
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11.5px] text-primary font-bold mt-2">
            <span>开始辨识</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>

        {/* Right: Recommended Exercise Videos */}
        <div 
          onClick={() => {
            setShowExerciseModal(true);
            setPlayingVideo(null);
            setIsVideoPlaying(false);
            setVideoPlayTime(0);
          }}
          className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm hover:border-secondary/40 hover:bg-surface-container-low/20 transition-all cursor-pointer flex flex-col justify-between min-h-[190px] relative overflow-hidden group active:scale-[0.98]"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-300"></div>
          <div>
            <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-3">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            </div>
            <h3 className="font-headline font-bold text-[15px] text-on-surface">导引养生功法</h3>
            <p className="font-sans text-[11.5px] text-outline mt-1.5 leading-relaxed">
              八段锦、太极拳等经络运动推荐，配备独家呼吸及心法指导。
            </p>
          </div>
          <div className="flex items-center gap-1 text-[11.5px] text-secondary font-bold mt-2">
            <span>功法视频</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </div>
        </div>
      </section>

      {/* MODAL 1: 中药材拍照鉴真 */}
      <AnimatePresence>
        {showHerbScanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHerbScanModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            {/* Content Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface rounded-2xl overflow-hidden shadow-2xl border border-surface-container flex flex-col max-h-[85vh] z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-surface-container flex justify-between items-center bg-primary text-on-primary">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px]">camera_enhance</span>
                  <h3 className="font-headline font-bold text-[16px]">中药材智能扫码鉴真</h3>
                </div>
                <button 
                  onClick={() => setShowHerbScanModal(false)}
                  className="w-8 h-8 rounded-full bg-on-primary/10 hover:bg-on-primary/20 flex items-center justify-center text-on-primary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto flex-1 text-left space-y-5">
                {!scanImage ? (
                  <div className="space-y-4">
                    <p className="font-sans text-[12.5px] text-on-surface-variant leading-relaxed">
                      请选择以下常见的中药材示例图片进行 AI 辨析测试，或点击下方按钮直接从您的相册上传拍摄好的药材照片：
                    </p>

                    {/* Presets Grid */}
                    <div className="grid grid-cols-3 gap-2.5">
                      {HERB_PRESETS.map((herb) => (
                        <div 
                          key={herb.id}
                          onClick={() => handleStartScan(herb.id)}
                          className="border border-surface-container-high rounded-xl overflow-hidden bg-surface-container-lowest hover:border-primary/50 cursor-pointer group active:scale-97 transition-all flex flex-col shadow-sm"
                        >
                          <img 
                            src={herb.image} 
                            alt={herb.name}
                            className="h-20 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                          />
                          <div className="p-1.5 flex-1 flex items-center justify-center text-center">
                            <span className="font-headline text-[10px] text-on-surface font-semibold line-clamp-1">
                              {herb.id === 'ginseng' ? '吉林野山参' : herb.id === 'cordyceps' ? '那曲冬虫夏草' : '熏硫干枸杞'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Custom Image Upload Input */}
                    <div className="pt-2">
                      <label className="border-2 border-dashed border-outline-variant hover:border-primary/50 bg-surface-container-low/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleCustomFileUpload}
                          className="hidden" 
                        />
                        <span className="material-symbols-outlined text-outline text-[32px] mb-2">upload_file</span>
                        <span className="font-headline text-[13px] font-bold text-on-surface">上传本地药材照片</span>
                        <span className="font-sans text-[10px] text-outline mt-1">支持 PNG, JPG 等格式物理拍照</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Image Preview with Scanning Animation */}
                    <div className="relative h-48 rounded-xl overflow-hidden border border-surface-container shadow-sm bg-black flex items-center justify-center">
                      <img 
                        src={scanImage} 
                        alt="药材鉴别预览" 
                        className="h-full object-contain"
                        referrerPolicy="no-referrer"
                      />

                      {/* Laser scanning line */}
                      {isScanning && (
                        <>
                          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-bounce shadow-[0_0_8px_#10b981]" style={{ top: '25%' }}></div>
                          <div className="absolute inset-0 bg-primary/10 flex flex-col items-center justify-center text-white backdrop-blur-[1px]">
                            <div className="w-8 h-8 rounded-full border-3 border-white/20 border-t-white animate-spin mb-2"></div>
                            <span className="font-sans text-[11px] font-bold tracking-wider bg-black/40 px-3 py-1 rounded-full">AI 光学多谱特征及道地性深度扫码中...</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Scan Results */}
                    {scanResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        {/* Summary Block */}
                        <div className={`p-4 rounded-xl border flex items-center justify-between ${
                          scanResult.authentic 
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                            : 'bg-red-50/70 border-red-200 text-red-950'
                        }`}>
                          <div>
                            <span className="font-sans text-[11px] uppercase tracking-wider opacity-85 block">鉴定结果</span>
                            <h4 className="font-headline text-[16px] font-bold mt-0.5">{scanResult.name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1.5 ${
                              scanResult.authentic ? 'bg-emerald-200/60 text-emerald-800' : 'bg-red-200/60 text-red-800'
                            }`}>
                              {scanResult.rating}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-sans text-[10px] opacity-85 block">真假符合度</span>
                            <span className={`font-headline text-[24px] font-extrabold ${
                              scanResult.authentic ? 'text-primary' : 'text-red-600'
                            }`}>{scanResult.score}</span>
                          </div>
                        </div>

                        {/* Evaluated Features List */}
                        <div className="bg-surface-container-low/40 border border-surface-container p-4 rounded-xl space-y-3">
                          <h5 className="font-headline text-[12.5px] font-bold text-on-surface border-b border-surface-container pb-1.5">道地性形态细微特征辨析</h5>
                          <div className="space-y-2.5">
                            {scanResult.features.map((feat: any, idx: number) => (
                              <div key={idx} className="flex gap-2.5 items-start text-[11.5px]">
                                <span className={`material-symbols-outlined text-[16px] mt-0.5 ${
                                  feat.isMatch ? 'text-primary' : 'text-red-500'
                                }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                                  {feat.isMatch ? 'check_circle' : 'warning'}
                                </span>
                                <div>
                                  <strong className="text-on-surface font-semibold">{feat.label}: </strong>
                                  <span className="text-on-surface-variant">{feat.desc}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* AI Summary Interpretation */}
                        <div className="p-3.5 bg-surface-container-high/20 border border-outline-variant/40 rounded-xl">
                          <span className="font-headline text-[11.5px] font-bold text-primary flex items-center gap-1.5 mb-1">
                            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                            AI 药理调理师评估：
                          </span>
                          <p className="font-sans text-[12px] text-on-surface-variant leading-relaxed text-justify">
                            {scanResult.description}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Footer scan action back button */}
                    <div className="flex gap-2 pt-1">
                      <button 
                        onClick={() => {
                          setScanImage(null);
                          setScanResult(null);
                        }}
                        className="flex-1 py-2.5 border border-outline hover:bg-surface-container text-on-surface font-headline text-[12.5px] font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        重新拍摄识别
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: 经络导引运动功法视频 */}
      <AnimatePresence>
        {showExerciseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExerciseModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            {/* Content Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-surface rounded-2xl overflow-hidden shadow-2xl border border-surface-container flex flex-col max-h-[85vh] z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-surface-container flex justify-between items-center bg-secondary text-on-secondary">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px]">play_circle</span>
                  <h3 className="font-headline font-bold text-[16px]">本草国医养生功法堂</h3>
                </div>
                <button 
                  onClick={() => setShowExerciseModal(false)}
                  className="w-8 h-8 rounded-full bg-on-secondary/10 hover:bg-on-secondary/20 flex items-center justify-center text-on-secondary transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto flex-1 text-left space-y-4">
                {!playingVideo ? (
                  <div className="space-y-4">
                    <p className="font-sans text-[12.5px] text-on-surface-variant leading-relaxed">
                      中医养生讲究“法于阴阳，和于术数”，合理的功法锻炼能宣通脏腑气血。以下是根据您当前身体特征主推的国医气血导引操：
                    </p>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary rounded-lg">
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      <span className="font-sans text-[11px] font-bold">小贴士: 您当前推荐功法主治 “健脾化湿”</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {EXERCISE_VIDEOS.map((video) => {
                        const isRecommended = video.targetConstitutions.includes(healthArchive.bodyType);
                        return (
                          <div 
                            key={video.id}
                            onClick={() => {
                              setPlayingVideo(video);
                              setIsVideoPlaying(true);
                              setVideoPlayTime(0);
                            }}
                            className={`border rounded-xl p-3.5 flex gap-3 cursor-pointer hover:bg-surface-container-low transition-all active:scale-[0.99] relative overflow-hidden ${
                              isRecommended ? 'border-primary/40 bg-primary-container/10' : 'border-surface-container-high bg-surface-container-lowest'
                            }`}
                          >
                            {isRecommended && (
                              <span className="absolute top-0 right-0 bg-primary text-on-primary text-[8px] font-bold px-2 py-0.5 rounded-bl">
                                主推功法
                              </span>
                            )}
                            <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-black flex-shrink-0">
                              <img 
                                src={video.cover} 
                                alt={video.name}
                                className="w-full h-full object-cover opacity-85"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <span className="material-symbols-outlined text-white text-[24px]">play_arrow</span>
                              </div>
                              <span className="absolute bottom-1 right-1 bg-black/60 text-white font-mono text-[8.5px] px-1 rounded">
                                {video.duration}
                              </span>
                            </div>
                            <div className="flex-grow flex flex-col justify-between">
                              <div>
                                <h4 className="font-headline text-[13px] font-bold text-on-surface leading-tight">{video.name}</h4>
                                <span className="text-[10px] bg-secondary-container/30 text-secondary font-medium px-2 py-0.5 rounded-full inline-block mt-1">
                                  {video.category}
                                </span>
                              </div>
                              <span className="font-sans text-[10px] text-outline">
                                适宜体质: {video.targetConstitutions.join(' / ')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Simulated Player Frame */}
                    <div className="relative h-48 rounded-xl overflow-hidden bg-black flex flex-col justify-between p-3 border border-surface-container shadow-sm">
                      <img 
                        src={playingVideo.cover} 
                        alt={playingVideo.name} 
                        className="absolute inset-0 w-full h-full object-cover opacity-50"
                        referrerPolicy="no-referrer"
                      />

                      {/* Video Player Header Overlay */}
                      <div className="relative z-10 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent p-1 -m-3 mb-0">
                        <span className="font-headline text-[12px] text-white font-bold pl-3">{playingVideo.name}</span>
                        <span className="bg-secondary text-on-secondary text-[8px] font-bold px-1.5 py-0.5 rounded mr-3">
                          {playingVideo.category}
                        </span>
                      </div>

                      {/* Active Pulse Animation simulating Video movement */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        {isVideoPlaying ? (
                          <div className="relative w-16 h-16 flex items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary/30 opacity-75"></span>
                            <button 
                              onClick={() => setIsVideoPlaying(false)}
                              className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center cursor-pointer shadow-md"
                            >
                              <span className="material-symbols-outlined text-[24px]">pause</span>
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setIsVideoPlaying(true)}
                            className="w-12 h-12 rounded-full bg-secondary text-on-secondary flex items-center justify-center cursor-pointer shadow-md"
                          >
                            <span className="material-symbols-outlined text-[24px]">play_arrow</span>
                          </button>
                        )}
                      </div>

                      {/* Video Player Progress bar */}
                      <div className="relative z-10 bg-gradient-to-t from-black/80 to-transparent p-1 -m-3 mt-auto pt-4 flex flex-col gap-1 px-3">
                        <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                          <div 
                            className="bg-secondary h-full transition-all duration-300"
                            style={{ width: `${(videoPlayTime / 60) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-white/90">
                          <span>00:{videoPlayTime < 10 ? `0${videoPlayTime}` : videoPlayTime} / {playingVideo.duration}</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-ping"></span>
                            智能心率同步中 ({healthArchive.vitals.heartRate} bpm)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step-by-Step Breathing & Guidance Synchronized */}
                    <div className="bg-surface-container-lowest border border-secondary/25 rounded-xl p-4 shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-surface-container pb-2">
                        <span className="font-headline text-[13px] font-bold text-secondary flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">record_voice_over</span>
                          实时功法呼吸与心法指导：
                        </span>
                        <span className="text-[10px] font-sans text-secondary bg-secondary/10 px-2 py-0.5 rounded-full font-bold">
                          步骤 {getCurrentStepIndex() + 1} / {playingVideo.steps.length}
                        </span>
                      </div>

                      {/* Guidance Box displaying current instruction dynamically */}
                      <div className="min-h-[50px] flex items-center justify-center text-center px-2 py-1">
                        <p className="font-sans text-[13px] text-on-surface font-semibold leading-relaxed animate-fade-in">
                          {playingVideo.steps[getCurrentStepIndex()]}
                        </p>
                      </div>

                      {/* Staggered progress indicators */}
                      <div className="flex gap-1.5 justify-center">
                        {playingVideo.steps.map((_: any, idx: number) => (
                          <div 
                            key={idx} 
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              idx === getCurrentStepIndex() ? 'w-6 bg-secondary' : 'w-1.5 bg-outline-variant/50'
                            }`}
                          ></div>
                        ))}
                      </div>
                    </div>

                    {/* Return back button */}
                    <button 
                      onClick={() => {
                        setPlayingVideo(null);
                        setIsVideoPlaying(false);
                      }}
                      className="w-full py-2.5 border border-outline hover:bg-surface-container text-on-surface font-headline text-[12.5px] font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      返回功法列表
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* Medicine-food risk alert banner */}
      <section 
        id="alert-risk"
        onClick={() => onNavigate('RISK_DETAILS')}
        className="mb-8 bg-error-container text-on-error-container rounded-2xl p-4 flex items-start gap-3 border border-red-500/10 cursor-pointer hover:bg-[#ffd2ce] transition-colors shadow-sm relative overflow-hidden"
      >
        <span className="material-symbols-outlined text-red-600 mt-0.5 animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
        <div>
          <h4 className="font-headline text-[14px] font-bold mb-0.5 flex items-center gap-1.5">
            食药冲突预警
            <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans tracking-wide">AI实时检测</span>
          </h4>
          <p className="font-sans text-[12px] leading-relaxed opacity-95">
            您记录的西药「阿司匹林」与近期推荐的「丹参饮」存在潜在交互风险，建议咨询医师。
          </p>
        </div>
        <span className="material-symbols-outlined text-[18px] text-outline ml-auto self-center">chevron_right</span>
      </section>

      {/* Recommended Medicinal Diet (Bento Card) */}
      <section className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="font-headline text-[18px] text-on-surface font-bold">节气药膳推荐</h3>
          <button 
            onClick={handleViewSoupRecipe}
            className="font-sans text-[12px] text-primary flex items-center hover:underline cursor-pointer font-medium"
          >
            查看做法 <span className="material-symbols-outlined text-xs ml-0.5">chevron_right</span>
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl overflow-hidden ambient-shadow border border-surface-container-low">
          <div 
            onClick={handleViewSoupRecipe}
            className="h-44 w-full relative bg-cover bg-center cursor-pointer group" 
            style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBDLXqa3X18eqUExw3uFEnIdg0vt8_b7Rl7oljmQ_ERDwpvI80Ja_RVbFbdoYBmhTrFxsxlP5LfrxP10yUnMo3UIg-V1t019fO6zSu7RMtU_bvcadHZcFuMpUKEI0CHeR8ctcQ8h8hpSNdn7CgfU9R_JKiR8fE402b43s3UkvPKcGoJb6Z-uuGg7eZtPomwVXPz1ICwjJXADITlpw206I4rTZ7vyHZLuNhfPYQwh8gXuYOo5wwtH4ZpLw')` }}
          >
            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
            <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-surface-container">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim"></span>
              <span className="font-sans text-[11px] text-on-surface font-semibold">润燥养阴</span>
            </div>
          </div>
          <div className="p-4">
            <h4 className="font-headline text-[15px] text-on-surface font-bold mb-1">百合莲子排骨汤</h4>
            <p className="font-body text-[13px] text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">
              秋燥伤肺，此汤能清心安神、润肺止咳。结合您的平和体质，非常适合作为本周的食补调理。
            </p>
            <button 
              onClick={handleViewSoupRecipe}
              className="w-full border border-primary text-primary font-headline text-[13px] py-2 rounded-xl hover:bg-primary hover:text-on-primary transition-all cursor-pointer font-bold"
            >
              查看做法
            </button>
          </div>
        </div>
      </section>

      {/* Traceability Entry */}
      <section className="mb-6">
        <div 
          onClick={handleViewTraceability}
          className="bg-surface-container-lowest rounded-2xl p-4 ambient-shadow border border-tertiary-fixed-dim/40 flex items-center justify-between relative overflow-hidden cursor-pointer hover:bg-surface-container-low transition-colors group"
        >
          <div className="absolute left-0 top-0 w-1 h-full bg-tertiary-fixed-dim"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary-container shadow-sm group-hover:scale-102 transition-transform">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <div>
              <h4 className="font-headline text-[14px] text-on-surface font-bold">道地药材溯源</h4>
              <p className="font-sans text-[11px] text-on-surface-variant">数字护照，扫码查验真伪</p>
            </div>
          </div>
          <button 
            className="bg-surface-container-high p-2 rounded-full text-on-surface-variant hover:bg-surface-variant transition-colors relative z-10 flex items-center justify-center cursor-pointer shadow-sm"
            aria-label="扫码溯源"
          >
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
          </button>
        </div>
      </section>
    </main>
  );
};
