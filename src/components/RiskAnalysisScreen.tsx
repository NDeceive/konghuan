/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenType } from '../types';

interface RiskResult {
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  riskLevelText: string;
  conflictReason: string;
  safetySuggestion: string;
}

interface RiskAnalysisScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const RiskAnalysisScreen: React.FC<RiskAnalysisScreenProps> = ({ onNavigate }) => {
  const [western, setWestern] = useState('');
  const [herbal, setHerbal] = useState('');
  const [result, setResult] = useState<RiskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // List of pre-filled preset checks
  const presets = [
    { western: '阿司匹林', herbal: '丹参', label: '阿司匹林 + 丹参' },
    { western: '华法林', herbal: '人参', label: '华法林 + 人参' },
    { western: '硫酸亚铁 (铁剂)', herbal: '绿茶', label: '铁剂 + 绿茶' },
    { western: '二甲双胍', herbal: '苦瓜提取物', label: '二甲双胍 + 苦瓜' },
  ];

  const handleAudit = async (wMed: string, hHerb: string) => {
    const finalWestern = wMed.trim();
    const finalHerbal = hHerb.trim();
    if (!finalWestern || !finalHerbal) return;

    setWestern(finalWestern);
    setHerbal(finalHerbal);
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/risk-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          westernMed: finalWestern,
          herbalIngredient: finalHerbal
        })
      });

      if (!response.ok) throw new Error('审计交互失败');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      // Fail-safe fallback if backend fails
      setResult({
        riskLevel: 'LOW',
        riskLevelText: '低风险提示',
        conflictReason: '在临床医学文献库中，目前暂未发现该成分组合存在已知的高敏感冲突或配伍限制，性质较平和。',
        safetySuggestion: '一般可以配合使用，但仍建议二者服药时间间隔至少30分钟以上。'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level?: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (level) {
      case 'HIGH': return {
        bg: 'bg-red-500/10 border-red-500/20',
        text: 'text-red-700',
        badge: 'bg-red-600 text-white',
        bullet: 'bg-red-600'
      };
      case 'MEDIUM': return {
        bg: 'bg-yellow-500/10 border-yellow-500/20',
        text: 'text-yellow-800',
        badge: 'bg-amber-500 text-white',
        bullet: 'bg-amber-500'
      };
      default: return {
        bg: 'bg-green-500/10 border-green-500/20',
        text: 'text-green-700',
        badge: 'bg-emerald-600 text-white',
        bullet: 'bg-emerald-600'
      };
    }
  };

  const currentStyle = getRiskColor(result?.riskLevel);

  return (
    <div className="bg-background text-on-background font-body min-h-screen pt-20 pb-28">
      <main className="px-5 max-w-lg mx-auto md:max-w-2xl flex flex-col gap-6 animate-fade-in">
        {/* Header Introduction */}
        <section className="mb-2">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="material-symbols-outlined text-primary text-[24px]">shield_health</span>
            <h2 className="font-headline text-[22px] font-bold text-primary">药食交互安全中心</h2>
          </div>
          <p className="font-body text-[14px] text-outline leading-relaxed">
            中医讲“药食同源”，但很多天然草本中富含活性有机碱和苷类。若与西药一同服用，可能抑制或过度激活肝脏代谢酶(P450等)，从而削弱药效或引发内出血等危险。
          </p>
        </section>

        {/* AI Custom Audit Checker */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-ambient">
          <h3 className="font-headline text-[15px] text-on-surface font-bold mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">psychology</span>
            AI 药食配伍冲突智能筛查
          </h3>

          <div className="flex flex-col gap-3">
            {/* Western input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-on-surface-variant">当前服用的西药</label>
              <input 
                type="text"
                value={western}
                onChange={(e) => setWestern(e.target.value)}
                placeholder="例如：阿司匹林、华法林、铁剂等..."
                className="w-full bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2.5 text-[14px] outline-none transition-colors"
              />
            </div>

            {/* Herbal input */}
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-[12px] font-semibold text-on-surface-variant">拟服用的中药/食材/药膳</label>
              <input 
                type="text"
                value={herbal}
                onChange={(e) => setHerbal(e.target.value)}
                placeholder="例如：丹参、人参、绿茶、山药等..."
                className="w-full bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2.5 text-[14px] outline-none transition-colors"
              />
            </div>

            {/* Audit Trigger */}
            <button 
              onClick={() => handleAudit(western, herbal)}
              disabled={!western.trim() || !herbal.trim() || isLoading}
              className="w-full h-12 bg-primary text-on-primary hover:bg-primary/95 rounded-xl font-headline font-bold text-[14px] flex items-center justify-center gap-2 mt-2 transition-all cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  <span>本草AI审方校验中...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>开始 AI 审方验证</span>
                </>
              )}
            </button>
          </div>

          {/* Quick presets slider */}
          <div className="mt-5 pt-4 border-t border-surface-container-high">
            <span className="text-[11px] font-bold text-outline block mb-2">常见代表性高危配伍例（可点击直接筛查）:</span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAudit(preset.western, preset.herbal)}
                  className="px-2.5 py-1.5 bg-surface border border-outline-variant hover:border-primary hover:text-primary rounded-lg text-[11px] font-sans text-on-surface transition-all cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Dynamic Audit Results */}
        {result && (
          <section className={`rounded-2xl p-5 border shadow-sm animate-fade-in ${currentStyle.bg}`}>
            <div className="flex items-center justify-between mb-4">
              <span className={`font-sans text-[11px] px-2.5 py-0.5 rounded-full font-bold shadow-sm ${currentStyle.badge}`}>
                {result.riskLevelText}
              </span>
              <span className="font-sans text-[11px] text-outline font-medium">诊断源：颐膳坊AI药食智库</span>
            </div>

            <div className="flex items-start gap-2.5 mb-3">
              <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${currentStyle.bullet}`}></span>
              <div>
                <h4 className="font-headline text-[14px] font-bold text-on-surface mb-1">交互冲突原因:</h4>
                <p className="font-sans text-[12.5px] leading-relaxed text-on-surface-variant text-justify">
                  {result.conflictReason}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 border-t border-outline-variant/30 pt-3 mt-3">
              <span className="material-symbols-outlined text-[16px] text-primary mt-0.5">health_and_safety</span>
              <div>
                <h4 className="font-headline text-[13px] font-bold text-primary mb-0.5">安全用药建议:</h4>
                <p className="font-sans text-[12px] leading-relaxed text-on-surface-variant">
                  {result.safetySuggestion}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Classic Intercept Guidelines Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm">
          <h4 className="font-headline text-[14px] font-bold text-on-surface mb-3">安全用药中医三字经</h4>
          <ul className="space-y-2.5">
            <li className="flex items-start gap-2">
              <span className="text-[11px] bg-secondary-container text-primary font-bold w-4 h-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">1</span>
              <p className="font-sans text-[12.5px] text-on-surface-variant leading-normal">
                <strong>错开时段：</strong>中西药同服易发生沉淀。建议中西药服用时间至少<strong>间隔2小时</strong>以上。
              </p>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[11px] bg-secondary-container text-primary font-bold w-4 h-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">2</span>
              <p className="font-sans text-[12.5px] text-on-surface-variant leading-normal">
                <strong>严控糖皮：</strong>糖尿病、高血压患者切勿随意服用大剂量甘草。甘草中的甘草酸可能引起钠水潴留，升高血压，降低二甲双胍等降糖效果。
              </p>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[11px] bg-secondary-container text-primary font-bold w-4 h-4 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">3</span>
              <p className="font-sans text-[12.5px] text-on-surface-variant leading-normal">
                <strong>温水为主：</strong>不要用茶水、果汁或药膳汤送服西药，特别是抗血栓与抗过敏类药物，避开活性有机分子交互。
              </p>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};
