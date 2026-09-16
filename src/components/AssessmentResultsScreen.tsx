/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenType, UserProfile, HealthArchive, HerbProduct, DietRecipe } from '../types';
import { PRODUCTS, RECIPES } from '../data/mockData';

interface WeeklyReportData {
  weeklyTrendSummary: string;
  improvementLabel: string;
  dietAdviceTitle: string;
  dietAdviceSummary: string;
  healthScoreDiff: number;
  suggestionsList: string[];
}

interface AssessmentResultsScreenProps {
  userProfile: UserProfile;
  healthArchive: HealthArchive;
  onNavigate: (screen: ScreenType) => void;
  onSelectRecipeById: (id: string) => void;
  onSelectProductById: (id: string) => void;
  onAddToCart: (product: HerbProduct) => void;
}

export const AssessmentResultsScreen: React.FC<AssessmentResultsScreenProps> = ({
  userProfile,
  healthArchive,
  onNavigate,
  onSelectRecipeById,
  onSelectProductById,
  onAddToCart,
}) => {
  // Weekly report states
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);
  const [errorReport, setErrorReport] = useState<string | null>(null);
  const [activeReportTab, setActiveReportTab] = useState<'trend' | 'diet' | 'tips'>('trend');
  const [checkedTips, setCheckedTips] = useState<boolean[]>([false, false, false]);

  const fetchWeeklyReport = async () => {
    setLoadingReport(true);
    setErrorReport(null);
    try {
      const response = await fetch('/api/weekly-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ healthArchive })
      });
      if (!response.ok) {
        throw new Error('网络异常，获取养生周报失败');
      }
      const data = await response.json();
      setWeeklyReport(data);
    } catch (err: any) {
      console.error(err);
      setErrorReport(err.message || '获取周报失败');
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    fetchWeeklyReport();
  }, [healthArchive.score, healthArchive.bodyType]);

  useEffect(() => {
    if (weeklyReport) {
      const key = `checked_tips_${healthArchive.score}_${healthArchive.bodyType}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          setCheckedTips(JSON.parse(cached));
        } catch (e) {
          setCheckedTips([false, false, false]);
        }
      } else {
        setCheckedTips([false, false, false]);
      }
    }
  }, [weeklyReport, healthArchive.score, healthArchive.bodyType]);

  const handleToggleTip = (index: number) => {
    const newChecked = [...checkedTips];
    newChecked[index] = !newChecked[index];
    setCheckedTips(newChecked);
    const key = `checked_tips_${healthArchive.score}_${healthArchive.bodyType}`;
    localStorage.setItem(key, JSON.stringify(newChecked));
  };

  // Find linked recipe and product matching body type
  const matchedRecipe = healthArchive.bodyType.includes('阴虚') 
    ? RECIPES.find(r => r.id === 'soup') || RECIPES[1]
    : RECIPES.find(r => r.id === 'porridge') || RECIPES[0];

  const matchedProduct = PRODUCTS.find(p => p.id === matchedRecipe.linkedProductId) || PRODUCTS[0];

  // Check conflicts
  const isAspirinAdded = healthArchive.answers.westernMeds.includes('阿司匹林');
  const isWarfarinAdded = healthArchive.answers.westernMeds.includes('华法林');

  const handleRecipeClick = () => {
    onSelectRecipeById(matchedRecipe.id);
    onNavigate('DIET_DETAIL');
  };

  const handleProductClick = () => {
    onSelectProductById(matchedProduct.id);
    onNavigate('PRODUCT_DETAIL');
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(matchedProduct);
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen pt-18 pb-28">
      {/* Module Title & Banner */}
      <div className="max-w-lg mx-auto md:max-w-2xl px-5 mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-headline text-[18px] font-bold text-on-surface flex items-center gap-2">
            体质分析报告
            <span className="bg-primary/10 text-primary text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full">
              九种体质辨识
            </span>
          </h2>
          <p className="font-sans text-[12px] text-on-surface-variant">
            中医九分法辨识 · 脏腑气血分析 · 智能调理指南
          </p>
        </div>
        <button
          onClick={() => onNavigate('AI_ADVISOR')}
          className="flex items-center gap-1.5 bg-secondary-container hover:bg-secondary-fixed/50 text-on-secondary-container px-3 py-1.5 rounded-xl font-headline text-[12px] font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex-shrink-0"
          title="前往本草 AI 在线咨询独立模块"
        >
          <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
          <span>问诊AI</span>
        </button>
      </div>

      <main className="px-5 max-w-lg mx-auto md:max-w-2xl flex flex-col gap-6 animate-fade-in">
          {/* Main Score Ring Hero */}
          <section className="bg-surface-container-lowest rounded-2xl p-6 ambient-shadow border border-surface-container-low flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2">
              <button className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface cursor-pointer shadow-sm">
                <span className="material-symbols-outlined text-[18px]">share</span>
              </button>
              <button className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest flex items-center justify-center text-on-surface cursor-pointer shadow-sm">
                <span className="material-symbols-outlined text-[18px]">download</span>
              </button>
            </div>

            <div className="relative w-36 h-36 flex items-center justify-center mb-4 mt-2">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path 
                  className="text-surface-container" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.8"
                ></path>
                <path 
                  className="text-primary" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeDasharray={`${healthArchive.score}, 100`} 
                  strokeWidth="2.8"
                  strokeLinecap="round"
                ></path>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-headline text-[38px] font-bold text-primary leading-none">{healthArchive.score}</span>
                <span className="font-sans text-[11px] text-outline font-medium">健康度评分</span>
              </div>
            </div>

            <h3 className="font-headline text-[22px] font-bold text-primary mb-1">
              {healthArchive.bodyType}
            </h3>
            <p className="font-sans text-[11px] text-outline">
              评分更新时间：{healthArchive.updatedAt}
            </p>
          </section>

          {/* 4D Health Meridian Grid */}
          <section className="grid grid-cols-2 gap-3">
            {[
              { label: '脏腑状态', val: healthArchive.bodyType.includes('阴虚') ? '心肾阴亏' : '脾肺气弱', icon: 'cardiology', color: 'text-red-500 bg-red-500/10' },
              { label: '气血盈亏', val: healthArchive.bodyType.includes('阴虚') ? '津液不足' : '气虚不运', icon: 'blood_pressured', color: 'text-pink-500 bg-pink-500/10' },
              { label: '阴阳属性', val: healthArchive.bodyType.includes('阴虚') ? '阴虚生热' : '阳气不足', icon: 'exposure', color: 'text-blue-500 bg-blue-500/10' },
              { label: '经络通畅', val: healthArchive.bodyType.includes('阴虚') ? '肾经不济' : '脾经滞涩', icon: 'flowsheet', color: 'text-tertiary bg-tertiary-container/20' }
            ].map((cell, idx) => (
              <div key={idx} className="bg-surface-container-lowest rounded-xl p-4 border border-surface-container-low flex items-center gap-3 shadow-sm">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${cell.color}`}>
                  <span className="material-symbols-outlined text-[18px]">{cell.icon}</span>
                </div>
                <div>
                  <span className="font-sans text-[10px] text-outline block">{cell.label}</span>
                  <span className="font-headline text-[13px] font-bold text-on-surface">{cell.val}</span>
                </div>
              </div>
            ))}
          </section>

          {/* 数智养生周报 Card */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm relative overflow-hidden text-left">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">calendar_month</span>
                <div>
                  <h3 className="font-headline font-bold text-[16px] text-on-surface flex items-center gap-1.5">
                    数智养生周报
                    <span className="bg-primary/10 text-primary text-[9px] font-sans px-2 py-0.5 rounded-full font-bold border border-primary/25">
                      AI 动态生成
                    </span>
                  </h3>
                  <p className="font-sans text-[11px] text-outline mt-0.5">历史体质变动与本周食养建议摘要</p>
                </div>
              </div>
              
              <button
                onClick={fetchWeeklyReport}
                disabled={loadingReport}
                className={`p-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border border-outline-variant/30 ${loadingReport ? 'animate-spin' : ''}`}
                title="重新生成周报"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
            </div>

            {loadingReport ? (
              <div className="h-56 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <p className="font-sans text-[12px] text-outline animate-pulse">正在深度分析您过去一周的体质指标变动...</p>
              </div>
            ) : errorReport ? (
              <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-center">
                <p className="font-sans text-[12px] text-red-700">⚠️ {errorReport}</p>
                <button 
                  onClick={fetchWeeklyReport}
                  className="mt-2 font-sans text-[11px] font-bold text-primary underline"
                >
                  重试加载
                </button>
              </div>
            ) : weeklyReport ? (
              <div>
                {/* Highlight Stats Banner */}
                <div className="bg-emerald-50/50 border border-emerald-200/60 p-3.5 rounded-xl flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                      <span className="font-headline text-[15px] font-bold">+{weeklyReport.healthScoreDiff}分</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-800 font-bold block bg-emerald-100/50 px-2 py-0.5 rounded-full w-fit">
                        {weeklyReport.improvementLabel}
                      </span>
                      <span className="font-sans text-[11.5px] text-on-surface-variant mt-0.5 block">
                        体质自首期评估稳步向好
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 text-emerald-700">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>trending_up</span>
                    <span className="font-headline text-[12.5px] font-bold">持续改善</span>
                  </div>
                </div>

                {/* Interaction Tabs */}
                <div className="flex border-b border-surface-container-high mb-4">
                  {[
                    { id: 'trend', label: '📈 体质趋势' },
                    { id: 'diet', label: '🍲 饮食建议' },
                    { id: 'tips', label: '🌱 养生调理' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveReportTab(tab.id as any)}
                      className={`flex-1 py-2 font-headline text-[12px] font-bold text-center border-b-2 transition-all cursor-pointer ${
                        activeReportTab === tab.id 
                          ? 'border-primary text-primary' 
                          : 'border-transparent text-outline hover:text-on-surface'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <AnimatePresence mode="wait">
                  {activeReportTab === 'trend' && (
                    <motion.div
                      key="trend-tab"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="text-left"
                    >
                      {/* Beautiful Sparkline Bar Chart */}
                      <div className="flex justify-between items-end h-28 px-3 py-1.5 mt-2 mb-4 bg-surface-container-low/40 rounded-xl border border-surface-container relative">
                        {[
                          { name: '1月前', score: 65, label: '气虚较重' },
                          { name: '3周前', score: 68, label: '开始调理' },
                          { name: '2周前', score: 72, label: '渐见成效' },
                          { name: '1周前', score: 75, label: '状态稳定' },
                          { name: '本周', score: healthArchive.score, label: `${healthArchive.bodyType}` },
                        ].map((data, idx) => {
                          const isCurrent = idx === 4;
                          return (
                            <div key={data.name} className="flex flex-col items-center flex-1 group relative">
                              {/* Hover info tooltip */}
                              <span className="absolute -top-12 z-10 scale-0 group-hover:scale-100 transition-all origin-bottom bg-surface border border-outline-variant/60 shadow-md p-1 px-1.5 rounded text-center pointer-events-none">
                                <span className="font-headline text-[10.5px] font-bold text-on-surface block leading-tight">{data.score}分</span>
                                <span className="font-sans text-[8px] text-outline block leading-none">{data.label}</span>
                              </span>
                              <div className="w-8 h-20 flex items-end justify-center">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: `${data.score}%` }}
                                  transition={{ delay: idx * 0.08, duration: 0.6, ease: "easeOut" }}
                                  className={`w-3.5 rounded-t cursor-pointer transition-all ${
                                    isCurrent 
                                      ? 'bg-gradient-to-t from-primary/80 to-primary shadow-[0_0_6px_rgba(16,185,129,0.4)]' 
                                      : 'bg-outline-variant hover:bg-primary/40'
                                  }`}
                                />
                              </div>
                              <span className={`font-sans text-[9.5px] mt-2 ${isCurrent ? 'text-primary font-bold' : 'text-outline'}`}>
                                {data.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="font-sans text-[12.5px] text-on-surface-variant leading-relaxed p-1 bg-surface-container-low/20 rounded-lg">
                        {weeklyReport.weeklyTrendSummary}
                      </p>
                    </motion.div>
                  )}

                  {activeReportTab === 'diet' && (
                    <motion.div
                      key="diet-tab"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="text-left"
                    >
                      <div className="flex items-center gap-1.5 mb-2 bg-primary-container text-on-primary-container px-3 py-1.5 rounded-lg w-fit">
                        <span className="material-symbols-outlined text-[15px]">restaurant_menu</span>
                        <span className="font-headline text-[11.5px] font-bold">{weeklyReport.dietAdviceTitle}</span>
                      </div>
                      <p className="font-sans text-[12.5px] text-on-surface-variant leading-relaxed mb-4">
                        {weeklyReport.dietAdviceSummary}
                      </p>

                      {/* Bento Recommendations */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/60">
                          <div className="flex items-center gap-1 text-emerald-800 mb-1.5">
                            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                            <span className="font-headline text-[11.5px] font-bold">推荐选用</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(healthArchive.bodyType.includes('阴虚') || healthArchive.bodyType.includes('内热')) ? (
                              ['百合', '鲜枸杞', '银耳', '沙参', '冬瓜'].map(h => (
                                <span key={h} className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-sans">{h}</span>
                              ))
                            ) : (
                              ['特级黄芪', '干山药', '茯苓', '陈皮', '红枣'].map(h => (
                                <span key={h} className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-sans">{h}</span>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-100/60">
                          <div className="flex items-center gap-1 text-amber-800 mb-1.5">
                            <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
                            <span className="font-headline text-[11.5px] font-bold">适度避让</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(healthArchive.bodyType.includes('阴虚') || healthArchive.bodyType.includes('内热')) ? (
                              ['辣椒', '花椒', '烈酒', '大料', '牛羊肉'].map(h => (
                                <span key={h} className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-sans">{h}</span>
                              ))
                            ) : (
                              ['冰激凌', '西瓜', '冷饮', '生梨', '肥肉'].map(h => (
                                <span key={h} className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-sans">{h}</span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeReportTab === 'tips' && (
                    <motion.div
                      key="tips-tab"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="text-left"
                    >
                      <p className="font-sans text-[11.5px] text-outline mb-3">💡 本周养生打卡清单（点击勾选完成打卡）：</p>
                      <div className="flex flex-col gap-2.5">
                        {weeklyReport.suggestionsList.map((tip, index) => (
                          <div 
                            key={index}
                            onClick={() => handleToggleTip(index)}
                            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] ${
                              checkedTips[index] 
                                ? 'bg-primary/5 border-primary/20 text-on-surface/60' 
                                : 'bg-surface border-outline-variant hover:border-primary/50 text-on-surface'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 flex-1 pr-2">
                              <span className={`material-symbols-outlined text-[18px] transition-colors ${
                                checkedTips[index] ? 'text-primary' : 'text-outline'
                              }`} style={{ fontVariationSettings: checkedTips[index] ? "'FILL' 1" : "'FILL' 0" }}>
                                {checkedTips[index] ? 'check_box' : 'check_box_outline_blank'}
                              </span>
                              <span className={`font-sans text-[12.5px] ${checkedTips[index] ? 'line-through opacity-70' : ''}`}>
                                {tip}
                              </span>
                            </div>
                            {checkedTips[index] && (
                              <span className="font-sans text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                已打卡
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : null}
          </section>

          {/* AI Medical Analysis Card */}
          <section className="bg-surface-container-lowest rounded-2xl p-5 ambient-shadow border border-surface-container-low">
            <div className="flex items-center gap-2 mb-3.5">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
              <h4 className="font-headline text-[14px] text-on-surface font-bold">医理简析 (AI 智能生成)</h4>
            </div>
            <p className="font-sans text-[13px] text-on-surface-variant leading-relaxed text-justify">
              {healthArchive.answers.caseOcr && (
                <span className="block mb-2 font-medium text-primary">根据您的扫描病例，系统注意到「{healthArchive.answers.caseOcr.split('，')[0]}」体征。</span>
              )}
              {healthArchive.answers.q1 === '经常这样，特别明显' 
                ? '您的舌象显示舌体胖大有齿痕，苔白腻；结合问卷中易疲劳、身重感，AI综合判定为“气虚夹湿”。脾主运化，气虚则运化无力，水湿内停。建议健脾益气，化湿祛浊。'
                : healthArchive.answers.q1 === '偶尔会，不算严重'
                ? '舌红、苔微白。分析出您当前脾胃机能稍有不顺，偶有水分滞溜，属于“平和夹湿”亚健康倾向。建议温食养脾，避寒避燥。'
                : '舌象润泽、舌苔微薄，体征属于“阴虚内热”状态。水液津亏，温养失度。调理原则当以养阴清热、甘凉生津为主。'
              }
            </p>
          </section>

          {/* Red Warning Banner (clash checks) */}
          {(isAspirinAdded || isWarfarinAdded) && (
            <section className="bg-error-container text-on-error-container rounded-2xl p-5 border border-red-500/10 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-600 mt-0.5 animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <div className="flex-grow">
                  <h4 className="font-headline text-[14px] font-bold mb-1">【药食交互预警】</h4>
                  <p className="font-sans text-[12.5px] leading-relaxed opacity-95 mb-3">
                    您记录正在服用西药「{isAspirinAdded ? '阿司匹林' : '华法林'}」！该西药与推荐药膳中若擅自加入含有「人参」或「丹参」等补气活血药材，存在高等级配伍禁忌，易导致抗凝过度，增加出血风险。
                  </p>
                  <button 
                    onClick={() => onNavigate('RISK_DETAILS')}
                    className="bg-red-600 hover:bg-red-700 text-white font-sans text-[11px] font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[14px]">shield_health</span>
                    前往药食交互安全中心查验
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Customized Recommended Medicinal Diet Recipe */}
          <section className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-surface-container-low ambient-shadow">
            <div className="p-5 border-b border-surface-container">
              <span className="text-[10px] font-bold text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full inline-block mb-2">本周主推节气药膳</span>
              <h4 className="font-headline text-[16px] text-on-surface font-bold">推荐食疗方案</h4>
            </div>

            <div 
              onClick={handleRecipeClick}
              className="h-44 w-full bg-cover bg-center cursor-pointer relative group"
              style={{ backgroundImage: `url('${matchedRecipe.image}')` }}
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all"></div>
              <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-md px-3 py-1 rounded-full border border-surface-container shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed"></span>
                <span className="font-sans text-[11px] text-on-surface font-semibold">{matchedRecipe.benefits[0]}</span>
              </div>
            </div>

            <div className="p-5">
              <h5 className="font-headline text-[15px] text-on-surface font-bold mb-1">{matchedRecipe.name}</h5>
              <p className="font-body text-[13px] text-on-surface-variant leading-relaxed line-clamp-2 mb-4">
                {matchedRecipe.description}
              </p>
              
              <div className="bg-surface rounded-xl p-3 border border-outline-variant/50 flex flex-wrap gap-2 mb-5">
                <span className="text-[11px] font-bold text-outline-variant block w-full mb-1">包含食材配比:</span>
                {matchedRecipe.ingredients.map((ing, idx) => (
                  <span key={idx} className="font-sans text-[11px] bg-surface-container-high text-on-surface px-2.5 py-1 rounded-md">
                    {ing.name} ({ing.quantity})
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleRecipeClick}
                  className="flex-1 border border-primary text-primary hover:bg-primary/5 font-headline text-[13px] py-2.5 rounded-xl transition-all font-bold cursor-pointer"
                >
                  查看做法详情
                </button>
              </div>
            </div>
          </section>

          {/* Linked Product Marketplace Card */}
          <section 
            onClick={handleProductClick}
            className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-low ambient-shadow flex gap-4 cursor-pointer hover:bg-surface-container-low transition-colors"
          >
            <img 
              referrerPolicy="no-referrer"
              src={matchedProduct.image} 
              alt={matchedProduct.name}
              className="w-24 h-24 rounded-xl object-cover"
            />
            <div className="flex-grow flex flex-col justify-between">
              <div>
                <span className="text-[9px] bg-tertiary-container/30 text-tertiary font-medium px-2 py-0.5 rounded-full border border-tertiary/10 inline-block mb-1.5">
                  精选道地食材 ({matchedProduct.origin})
                </span>
                <h5 className="font-headline text-[14px] text-on-surface font-bold leading-none mb-1">
                  {matchedProduct.name}
                </h5>
                <p className="font-sans text-[11.5px] text-on-surface-variant line-clamp-1">
                  {matchedProduct.description}
                </p>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-baseline gap-1">
                  <span className="font-sans text-[11px] text-primary">¥</span>
                  <span className="font-headline text-[16px] font-bold text-primary">{matchedProduct.price}</span>
                </div>
                <button 
                  onClick={handleAddToCartClick}
                  className="bg-primary text-on-primary font-headline text-[12px] px-3.5 py-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container font-semibold cursor-pointer transition-all active:scale-97 flex items-center gap-1 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_shopping_cart</span>
                  加入方剂包
                </button>
              </div>
            </div>
          </section>

          {/* Bottom Call to Actions - Link to TCM AI Consultation Module */}
          <section className="bg-gradient-to-r from-surface-container-lowest to-secondary-container/20 rounded-2xl p-4 border border-secondary-fixed-dim/30 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-on-secondary shadow-sm flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">psychology</span>
              </div>
              <div>
                <h4 className="font-headline text-[13.5px] font-bold text-on-surface">
                  对体质报告或用药配伍有疑问？
                </h4>
                <p className="font-sans text-[11.5px] text-on-surface-variant">
                  进入「本草 AI 咨询」独立模块，与AI中医师一对一问答
                </p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('AI_ADVISOR')}
              className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container px-3.5 py-2 rounded-xl font-headline text-[12px] font-bold cursor-pointer transition-all shadow-xs active:scale-95 flex items-center gap-1 flex-shrink-0"
            >
              <span>立即咨询</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </section>
        </main>
    </div>
  );
};
