/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenType, UserProfile, HealthArchive, UserRole } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ProfileScreenProps {
  userProfile: UserProfile;
  healthArchive: HealthArchive;
  onNavigate: (screen: ScreenType) => void;
  onLogout: () => void;
  onSetStepperStep: (step: number) => void;
  onUpdateRole: (role: UserRole) => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface border border-outline-variant p-2.5 rounded-xl shadow-md font-sans text-[11.5px] leading-relaxed text-left">
        <p className="font-bold text-primary mb-0.5">{data.name}</p>
        <p className="text-on-surface">
          健康指数: <span className="font-bold font-mono text-[13px] text-emerald-700">{data.score}</span> 分
        </p>
        <p className="text-outline text-[10.5px]">
          状态/体质: <span className="font-semibold text-on-surface-variant">{data.label}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  healthArchive,
  onNavigate,
  onLogout,
  onSetStepperStep,
  onUpdateRole,
}) => {
  // Settings States
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'tcm' | 'account' | 'kyc' | 'address'>('tcm');
  const [dietRestrictions, setDietRestrictions] = useState<string[]>(['cold', 'spicy']);
  const [conditioningPref, setConditioningPref] = useState<string>('diet');
  const [deviceAutoSync, setDeviceAutoSync] = useState<boolean>(true);
  const [elderCareMode, setElderCareMode] = useState<boolean>(false);
  const [tonguePrivacyMode, setTonguePrivacyMode] = useState<string>('local');
  const [pushSeasonal, setPushSeasonal] = useState<boolean>(true);
  const [cacheSize, setCacheSize] = useState<string>('12.4 MB');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Account States (Local overrides)
  const [profileName, setProfileName] = useState<string>(userProfile.name);
  const [profilePhone, setProfilePhone] = useState<string>(userProfile.phone);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // KYC (Real-name Verification) States
  const [kycVerified, setKycVerified] = useState<boolean>(false);
  const [kycRealName, setKycRealName] = useState<string>('');
  const [kycIdCard, setKycIdCard] = useState<string>('');

  // Address Management States
  const [addresses, setAddresses] = useState<any[]>([
    {
      id: 'addr-1',
      name: '张仲景',
      phone: '13912341800',
      region: '河南省南阳市宛城区',
      detail: '医圣祠路 医圣山庄 3号楼',
      isDefault: true
    },
    {
      id: 'addr-2',
      name: '李心悦',
      phone: '18888889999',
      region: '浙江省杭州市西湖区',
      detail: '灵隐路草本堂 8号院',
      isDefault: false
    }
  ]);
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [editAddressId, setEditAddressId] = useState<string | null>(null); // null means adding
  const [formAddrName, setFormAddrName] = useState<string>('');
  const [formAddrPhone, setFormAddrPhone] = useState<string>('');
  const [formAddrRegion, setFormAddrRegion] = useState<string>('河南省南阳市宛城区');
  const [formAddrDetail, setFormAddrDetail] = useState<string>('');
  const [formAddrIsDefault, setFormAddrIsDefault] = useState<boolean>(false);

  useEffect(() => {
    // Load from localStorage
    const savedDiet = localStorage.getItem('settings_diet_restrictions');
    if (savedDiet) {
      try { setDietRestrictions(JSON.parse(savedDiet)); } catch (e) {}
    }
    
    const savedPref = localStorage.getItem('settings_conditioning_pref');
    if (savedPref) setConditioningPref(savedPref);

    const savedSync = localStorage.getItem('settings_device_auto_sync');
    if (savedSync) setDeviceAutoSync(savedSync === 'true');

    const savedElder = localStorage.getItem('settings_elder_care_mode');
    if (savedElder) setElderCareMode(savedElder === 'true');

    const savedPrivacy = localStorage.getItem('settings_tongue_privacy_mode');
    if (savedPrivacy) setTonguePrivacyMode(savedPrivacy);

    const savedSeasonal = localStorage.getItem('settings_push_seasonal');
    if (savedSeasonal) setPushSeasonal(savedSeasonal === 'true');

    const savedCache = localStorage.getItem('settings_cache_size');
    if (savedCache) setCacheSize(savedCache);

    // Load account overrides
    const savedName = localStorage.getItem('settings_nickname');
    if (savedName) setProfileName(savedName);
    const savedPhone = localStorage.getItem('settings_phone');
    if (savedPhone) setProfilePhone(savedPhone);

    // Load KYC verification state
    const savedKycVerified = localStorage.getItem('settings_kyc_verified');
    if (savedKycVerified) setKycVerified(savedKycVerified === 'true');
    const savedKycName = localStorage.getItem('settings_kyc_real_name');
    if (savedKycName) setKycRealName(savedKycName);
    const savedKycIdCard = localStorage.getItem('settings_kyc_id_card');
    if (savedKycIdCard) setKycIdCard(savedKycIdCard);

    // Load Addresses
    const savedAddresses = localStorage.getItem('settings_addresses');
    if (savedAddresses) {
      try {
        const parsed = JSON.parse(savedAddresses);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(parsed);
        }
      } catch (e) {}
    }
  }, [userProfile.name, userProfile.phone]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleSaveSetting = (key: string, value: any) => {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
    triggerToast('设置项已自动更新');
  };

  const handleClearCache = () => {
    setCacheSize('0.0 KB');
    localStorage.setItem('settings_cache_size', '0.0 KB');
    triggerToast('系统缓存清理成功');
  };

  const handleUpdateVitals = () => {
    onSetStepperStep(5); // step 5 is hardware vitals
    onNavigate('STEPPER');
  };

  // Historic health score data
  const trendData = [
    { name: '1个月前', score: 65, label: '气虚较重 (畏寒倦怠)' },
    { name: '3周前', score: 68, label: '开始调理 (偶有神疲)' },
    { name: '2周前', score: 72, label: '渐见成效 (手温回暖)' },
    { name: '1周前', score: 75, label: '状态稳定 (湿气渐消)' },
    { name: '本次评估', score: healthArchive.score, label: `${healthArchive.bodyType} (最新)` },
  ];

  return (
    <div className={`bg-background text-on-background font-body min-h-screen pt-20 pb-28 transition-all duration-300 ${elderCareMode ? 'text-[112%] md:text-[115%] [&_span]:!text-[108%] [&_p]:!text-[108%] [&_h3]:!text-[115%] [&_h4]:!text-[112%]' : ''}`}>
      <main className="px-5 max-w-lg mx-auto md:max-w-2xl flex flex-col gap-5 animate-fade-in">
        
        {/* User Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute -left-10 -bottom-10 w-28 h-28 bg-primary/5 rounded-full blur-xl"></div>
          
          <img 
            referrerPolicy="no-referrer"
            src={userProfile.avatar} 
            alt={profileName}
            className="w-16 h-16 rounded-full object-cover border border-outline-variant relative z-10"
          />
          <div className="flex-grow relative z-10">
            <h3 className="font-headline text-[18px] font-bold text-primary flex items-center gap-1.5 leading-none">
              {profileName}
              <span className="material-symbols-outlined text-[16px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              {kycVerified && (
                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-sans px-1.5 py-0.5 rounded-full font-bold border border-emerald-300">
                  已实名
                </span>
              )}
            </h3>
            <p className="font-sans text-[11px] text-outline mt-1 font-medium">{userProfile.memberStatus}</p>
          </div>
        </section>

        {/* User Quick Stats */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-low shadow-sm grid grid-cols-3 divide-x divide-surface-container text-center">
          <div>
            <span className="font-headline text-[18px] font-bold text-primary block leading-none mb-1">
              {userProfile.favoritesCount}
            </span>
            <span className="font-sans text-[11px] text-outline">我的收藏</span>
          </div>
          <div>
            <span className="font-headline text-[18px] font-bold text-primary block leading-none mb-1">
              {userProfile.couponsCount}
            </span>
            <span className="font-sans text-[11px] text-outline">优惠药券</span>
          </div>
          <div>
            <span className="font-headline text-[18px] font-bold text-primary block leading-none mb-1">
              {userProfile.footprintsCount}
            </span>
            <span className="font-sans text-[11px] text-outline">数智足迹</span>
          </div>
        </section>

        {/* Health Archive Mini Widget */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>health_and_safety</span>
              <h4 className="font-headline text-[14px] text-on-surface font-bold">我的中药数字健康档案</h4>
            </div>
            <span className="font-sans text-[10px] text-outline font-bold bg-surface px-2 py-0.5 rounded border border-outline-variant">
              体质：{healthArchive.bodyType}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-surface p-3.5 rounded-xl border border-outline-variant mb-4 text-center">
            <div>
              <span className="font-sans text-[15px] font-bold text-primary block leading-none mb-1">
                {healthArchive.vitals.heartRate} <span className="text-[10px] font-normal text-outline">BPM</span>
              </span>
              <span className="text-[9.5px] text-outline">智能脉率</span>
            </div>
            <div>
              <span className="font-sans text-[15px] font-bold text-primary block leading-none mb-1">
                {healthArchive.vitals.bloodOxygen}%
              </span>
              <span className="text-[9.5px] text-outline">血氧浓度</span>
            </div>
            <div>
              <span className="font-sans text-[15px] font-bold text-primary block leading-none mb-1">
                {healthArchive.vitals.temperature}°C
              </span>
              <span className="text-[9.5px] text-outline">智能体温</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => onNavigate('ASSESSMENT_RESULTS')}
              className="flex-1 py-2 rounded-xl border border-primary text-primary hover:bg-primary/5 font-headline text-[12px] font-bold transition-all cursor-pointer text-center"
            >
              查看完整体质报告
            </button>
            <button 
              onClick={handleUpdateVitals}
              className="flex-1 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/95 font-headline text-[12px] font-bold transition-all cursor-pointer text-center"
            >
              更新健康体征
            </button>
          </div>
        </section>

        {/* 体质健康指数历史趋势图表 (Health Score Trend Chart) */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
              <h4 className="font-headline text-[14px] text-on-surface font-bold">体质健康分数历史趋势</h4>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              稳步上升中
            </span>
          </div>
          
          <p className="font-sans text-[11px] text-outline mb-4 leading-tight text-left">
            结合您的问卷评测历史、AI大模型辨识和数智硬件脉率体温分析，综合研判体质改善态势。
          </p>

          <div className="w-full h-[180px] -ml-2 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8ba888" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8ba888" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ecece4" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#888', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e2d8' }}
                />
                <YAxis 
                  domain={[50, 100]} 
                  tick={{ fill: '#888', fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e2d8' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#5a5a40" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#scoreColor)" 
                  activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2, fill: '#5a5a40' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 bg-surface p-3 rounded-xl border border-outline-variant/60">
            <div className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-amber-600 mt-0.5 animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
              <div className="text-[11.5px] text-on-surface-variant leading-relaxed text-left">
                <span className="font-bold text-primary">智能调理分析：</span>
                您的健康指数从 <span className="font-bold text-primary">65分</span> 稳步提升至 <span className="font-bold text-emerald-700">{healthArchive.score}分</span>。
                这归功于您近期坚持使用「黄芪山药养生粥」进行食补，并规律同步智能脉率、体温数据。系统建议您继续秉承这一调理模式。
              </div>
            </div>
          </div>
        </section>

        {/* Secondary functional lists */}
        <section className="bg-surface-container-lowest rounded-2xl p-3.5 border border-surface-container-low shadow-sm divide-y divide-surface-container">
          <div className="py-3 flex justify-between items-center cursor-pointer hover:bg-surface-container-low px-1.5 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">shopping_bag</span>
              <span className="font-sans text-[13.5px] text-on-surface font-semibold">我的模拟方剂订单</span>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
          </div>

          <div className="py-3 flex justify-between items-center cursor-pointer hover:bg-surface-container-low px-1.5 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">qr_code_scanner</span>
              <span className="font-sans text-[13.5px] text-on-surface font-semibold">数字护照扫码核验历史</span>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
          </div>

          <div 
            onClick={() => onNavigate('RISK_DETAILS')}
            className="py-3 flex justify-between items-center cursor-pointer hover:bg-surface-container-low px-1.5 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">shield_health</span>
              <span className="font-sans text-[13.5px] text-on-surface font-semibold">我的药食冲突避险档案</span>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
          </div>

          <div 
            onClick={() => setShowSettings(true)}
            className="py-3 flex justify-between items-center cursor-pointer hover:bg-surface-container-low px-1.5 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-[20px]">settings</span>
              <span className="font-sans text-[13.5px] text-on-surface font-semibold">系统参数与健康偏好</span>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
          </div>
        </section>


      </main>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[100] bg-primary text-on-primary px-4 py-2.5 rounded-full shadow-lg font-headline text-[12px] font-bold flex items-center gap-2 border border-primary-container"
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel Drawer */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end justify-center md:items-center p-0 md:p-4">
            <motion.div
              initial={{ y: "100%", opacity: 0.5 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="bg-surface text-on-surface w-full max-w-lg md:max-w-xl h-[88vh] md:h-[80vh] rounded-t-3xl md:rounded-2xl flex flex-col overflow-hidden shadow-2xl border border-outline-variant/40"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">settings</span>
                  <div>
                    <h3 className="font-headline font-bold text-[15.5px] text-on-surface">系统设置与个人中心</h3>
                    <p className="font-sans text-[11px] text-outline mt-0.5">管理账号安全、实名认证、收货地址与调理偏好</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    setShowAddressForm(false);
                  }}
                  className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant flex items-center justify-center cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex border-b border-surface-container bg-surface-container-lowest shrink-0 overflow-x-auto scrollbar-none px-2">
                {[
                  { id: 'tcm', label: '偏好与系统', icon: 'settings' },
                  { id: 'account', label: '账号设置', icon: 'person' },
                  { id: 'kyc', label: '实名认证', icon: 'badge' },
                  { id: 'address', label: '地址编辑', icon: 'location_on' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSettingsTab(tab.id as any);
                      setShowAddressForm(false);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-3 border-b-2 font-headline text-[12px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                      settingsTab === tab.id
                        ? 'border-primary text-primary bg-primary/5 font-extrabold'
                        : 'border-transparent text-outline hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 text-left">
                
                {/* TAB 1: TCM Preferences & System */}
                {settingsTab === 'tcm' && (
                  <div className="space-y-6">
                    {/* Section 1: Dietary & Health Preferences */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 border-b border-surface-container-high pb-1.5">
                        <span className="material-symbols-outlined text-primary text-[18px]">restaurant_menu</span>
                        <h4 className="font-headline font-bold text-[13px] text-primary">中医食疗与调理偏好</h4>
                      </div>
                      
                      {/* Dietary Restrictions Toggles */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-outline block mb-1">健康饮食禁忌 (多选)：</label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'cold', label: '❄️ 忌生冷/冰品' },
                            { id: 'spicy', label: '🔥 忌辛辣/燥热' },
                            { id: 'greasy', label: '🥓 忌油腻/大甘' },
                            { id: 'seafood', label: '🍤 忌海鲜/发物' },
                          ].map((item) => {
                            const isChecked = dietRestrictions.includes(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  let newDiet = [...dietRestrictions];
                                  if (newDiet.includes(item.id)) {
                                    newDiet = newDiet.filter(i => i !== item.id);
                                  } else {
                                    newDiet.push(item.id);
                                  }
                                  setDietRestrictions(newDiet);
                                  handleSaveSetting('settings_diet_restrictions', newDiet);
                                }}
                                className={`p-2.5 rounded-xl border text-center font-headline text-[11.5px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                                  isChecked 
                                    ? 'bg-primary/10 border-primary text-primary' 
                                    : 'bg-surface border-outline-variant hover:border-primary/40 text-on-surface'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[15px]">
                                  {isChecked ? 'check_box' : 'check_box_outline_blank'}
                                </span>
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Conditioning Preference dropdown */}
                      <div className="pt-2">
                        <label className="text-[11px] font-bold text-outline block mb-1.5">本草调理偏好方式：</label>
                        <select 
                          value={conditioningPref}
                          onChange={(e) => {
                            setConditioningPref(e.target.value);
                            handleSaveSetting('settings_conditioning_pref', e.target.value);
                          }}
                          className="bg-surface-container border border-outline-variant rounded-xl p-2.5 text-[12px] font-headline font-bold text-on-surface w-full focus:outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="diet">🍵 药食同源 (推崇中药食疗与每日食补)</option>
                          <option value="mild">🌿 温和草药 (推崇代茶饮与轻度中成药)</option>
                          <option value="fast">💊 汤剂针灸 (推崇浓缩药汤与外治干预)</option>
                        </select>
                      </div>
                    </div>

                    {/* Section 2: Smart Devices & Hardware Sync */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 border-b border-surface-container-high pb-1.5">
                        <span className="material-symbols-outlined text-primary text-[18px]">watch</span>
                        <h4 className="font-headline font-bold text-[13px] text-primary">数智硬件与体征同步</h4>
                      </div>
                      
                      {/* Sync switch */}
                      <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/40">
                        <div>
                          <span className="font-headline text-[12.5px] font-bold text-on-surface block">脉率与血氧自动同步</span>
                          <span className="font-sans text-[10px] text-outline mt-0.5 block">连接您的数智手环/手表，自动记录气血体征</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const val = !deviceAutoSync;
                            setDeviceAutoSync(val);
                            handleSaveSetting('settings_device_auto_sync', val);
                          }}
                          className={`w-11 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer flex items-center ${
                            deviceAutoSync ? 'bg-primary' : 'bg-outline-variant'
                          }`}
                        >
                          <motion.div 
                            layout 
                            className="w-5 h-5 rounded-full bg-white shadow-xs" 
                            animate={{ x: deviceAutoSync ? 20 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>

                      {/* Sync frequency choice */}
                      {deviceAutoSync && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="pl-3 py-1 space-y-1"
                        >
                          <span className="text-[10px] text-outline font-bold">同步读取频率：</span>
                          <div className="flex gap-2">
                            {['5m', '1h', 'manual'].map((f) => (
                              <button
                                key={f}
                                type="button"
                                onClick={() => triggerToast('数据读取频率已修改')}
                                className="flex-1 py-1 px-2.5 rounded bg-surface border border-outline-variant hover:border-primary text-center font-sans text-[11px] text-on-surface hover:text-primary cursor-pointer"
                              >
                                {f === '5m' ? '每 5 分钟' : f === '1h' ? '每小时' : '仅手动更新'}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Section 3: Privacy & Data Protection */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 border-b border-surface-container-high pb-1.5">
                        <span className="material-symbols-outlined text-primary text-[18px]">security</span>
                        <h4 className="font-headline font-bold text-[13px] text-primary">数据安全与隐私授权</h4>
                      </div>

                      {/* Tongue photo privacy */}
                      <div>
                        <label className="text-[11px] font-bold text-outline block mb-1.5">AI 舌相分析照片存储方案：</label>
                        <select 
                          value={tonguePrivacyMode}
                          onChange={(e) => {
                            setTonguePrivacyMode(e.target.value);
                            handleSaveSetting('settings_tongue_privacy_mode', e.target.value);
                          }}
                          className="bg-surface-container border border-outline-variant rounded-xl p-2.5 text-[12px] font-headline font-bold text-on-surface w-full focus:outline-none focus:border-primary cursor-pointer"
                        >
                          <option value="local">🔒 仅在本地沙盒暂存 (不留痕，诊断后即刻销毁)</option>
                          <option value="cloud_encrypted">☁️ 云端端到端加密存储 (用于体质趋势和对比分析)</option>
                        </select>
                      </div>

                      {/* Clear Cache */}
                      <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/40">
                        <div>
                          <span className="font-headline text-[12.5px] font-bold text-on-surface block">清理本草离线缓存</span>
                          <span className="font-sans text-[10px] text-outline mt-0.5 block">包括方剂商品图片、离线辨识算法模型和日志</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11.5px] font-bold text-outline">{cacheSize}</span>
                          <button
                            type="button"
                            onClick={handleClearCache}
                            disabled={cacheSize === '0.0 KB'}
                            className="px-2.5 py-1.5 rounded-lg bg-surface hover:bg-surface-container border border-outline-variant hover:border-red-500 hover:text-red-600 font-headline text-[11px] font-bold cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            清除
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Accessibility & Care */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 border-b border-surface-container-high pb-1.5">
                        <span className="material-symbols-outlined text-primary text-[18px]">elderly</span>
                        <h4 className="font-headline font-bold text-[13px] text-primary">无障碍与系统关怀</h4>
                      </div>

                      {/* Elder Care Mode */}
                      <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/40">
                        <div>
                          <span className="font-headline text-[12.5px] font-bold text-on-surface block">👵 长辈关怀大字模式</span>
                          <span className="font-sans text-[10px] text-outline mt-0.5 block">整体字号加粗并放大，让年长者阅读调理方更轻松</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const val = !elderCareMode;
                            setElderCareMode(val);
                            handleSaveSetting('settings_elder_care_mode', val);
                          }}
                          className={`w-11 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer flex items-center ${
                            elderCareMode ? 'bg-primary' : 'bg-outline-variant'
                          }`}
                        >
                          <motion.div 
                            layout 
                            className="w-5 h-5 rounded-full bg-white shadow-xs" 
                            animate={{ x: elderCareMode ? 20 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>

                      {/* Push Notifications Toggle */}
                      <div className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl border border-outline-variant/40">
                        <div>
                          <span className="font-headline text-[12.5px] font-bold text-on-surface block">📅 每日调理钟点提醒</span>
                          <span className="font-sans text-[10px] text-outline mt-0.5 block">早上食疗打卡和夜间温水泡脚的暖心推送提醒</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const val = !pushSeasonal;
                            setPushSeasonal(val);
                            handleSaveSetting('settings_push_seasonal', val);
                          }}
                          className={`w-11 h-6 rounded-full relative p-0.5 transition-colors cursor-pointer flex items-center ${
                            pushSeasonal ? 'bg-primary' : 'bg-outline-variant'
                          }`}
                        >
                          <motion.div 
                            layout 
                            className="w-5 h-5 rounded-full bg-white shadow-xs" 
                            animate={{ x: pushSeasonal ? 20 : 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Account Settings */}
                {settingsTab === 'account' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-1.5 border-b border-surface-container-high pb-1.5">
                      <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                      <h4 className="font-headline font-bold text-[13px] text-primary">基本账号设置</h4>
                    </div>

                    <div className="space-y-4">
                      {/* Name input */}
                      <div>
                        <label className="text-[11px] font-bold text-outline block mb-1">用户昵称 / 姓名</label>
                        <input
                          type="text"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="bg-surface-container border border-outline-variant rounded-xl p-2.5 text-[12.5px] font-headline font-bold text-on-surface w-full focus:outline-none focus:border-primary"
                          placeholder="请输入您的昵称"
                        />
                      </div>

                      {/* Phone input */}
                      <div>
                        <label className="text-[11px] font-bold text-outline block mb-1">绑定手机号</label>
                        <input
                          type="tel"
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="bg-surface-container border border-outline-variant rounded-xl p-2.5 text-[12.5px] font-headline font-bold text-on-surface w-full focus:outline-none focus:border-primary"
                          placeholder="请输入绑定的手机号"
                        />
                      </div>

                      {/* Save Account Info */}
                      <button
                        type="button"
                        onClick={() => {
                          if (!profileName.trim()) {
                            triggerToast('昵称不能为空');
                            return;
                          }
                          localStorage.setItem('settings_nickname', profileName);
                          localStorage.setItem('settings_phone', profilePhone);
                          triggerToast('基本账户信息已保存');
                        }}
                        className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-headline text-[12px] font-bold shadow-xs hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer"
                      >
                        保存基本账号信息
                      </button>
                    </div>

                    {/* Change Password Panel */}
                    <div className="pt-4 border-t border-surface-container-high space-y-4">
                      <div className="flex items-center gap-1.5 pb-1">
                        <span className="material-symbols-outlined text-primary text-[18px]">lock_reset</span>
                        <h4 className="font-headline font-bold text-[13px] text-primary">修改登录密码</h4>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-[11px] font-bold text-outline block mb-1">原密码</label>
                          <input
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="bg-surface-container border border-outline-variant rounded-xl p-2.5 text-[12.5px] font-sans text-on-surface w-full focus:outline-none focus:border-primary"
                            placeholder="请输入当前密码"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-outline block mb-1">新密码</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-surface-container border border-outline-variant rounded-xl p-2.5 text-[12.5px] font-sans text-on-surface w-full focus:outline-none focus:border-primary"
                            placeholder="不少于6位新密码"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-outline block mb-1">确认新密码</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="bg-surface-container border border-outline-variant rounded-xl p-2.5 text-[12.5px] font-sans text-on-surface w-full focus:outline-none focus:border-primary"
                            placeholder="再次输入新密码"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (!oldPassword) {
                              triggerToast('请输入原密码进行身份验证');
                              return;
                            }
                            if (newPassword.length < 6) {
                              triggerToast('新密码长度不能少于6位');
                              return;
                            }
                            if (newPassword !== confirmPassword) {
                              triggerToast('两次输入的新密码不一致');
                              return;
                            }
                            // Simulate success
                            setOldPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            triggerToast('密码重置成功，请妥善保管新密码');
                          }}
                          className="w-full py-2.5 bg-secondary text-on-secondary rounded-xl font-headline text-[12px] font-bold shadow-xs hover:bg-secondary-container hover:text-on-secondary-container transition-all cursor-pointer"
                        >
                          确认修改密码
                        </button>
                      </div>
                    </div>

                    {/* Exit / Logout Action Button */}
                    <div className="pt-4 border-t border-surface-container-high">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSettings(false);
                          onLogout();
                        }}
                        className="w-full py-2.5 bg-error-container hover:bg-red-200/60 text-red-700 rounded-xl font-headline text-[12.5px] font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-red-500/10"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        退出当前账号登录
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 3: KYC Real-name Verification */}
                {settingsTab === 'kyc' && (
                  <div className="space-y-5">
                    <div className="flex items-center gap-1.5 border-b border-surface-container-high pb-1.5">
                      <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
                      <h4 className="font-headline font-bold text-[13px] text-primary">实名身份核验</h4>
                    </div>

                    {kycVerified ? (
                      <div className="bg-emerald-500/10 border border-emerald-300 rounded-2xl p-5 space-y-4 text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                        </div>
                        <div>
                          <h4 className="font-headline font-bold text-[15px] text-emerald-800">您已完成实名身份核验</h4>
                          <p className="font-sans text-[11px] text-emerald-700/80 mt-1">根据国家中医药药事服务与互联网诊疗规范，实名认证已锚定至联盟链存证。</p>
                        </div>

                        <div className="bg-surface/80 rounded-xl p-3 border border-emerald-100 text-left space-y-2 text-[12px]">
                          <div className="flex justify-between">
                            <span className="text-outline">核验状态：</span>
                            <span className="font-bold text-emerald-700">验证通过 (已上链)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-outline">真实姓名：</span>
                            <span className="font-bold text-on-surface">
                              {kycRealName.substring(0, 1) + '*'.repeat(Math.max(1, kycRealName.length - 1))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-outline">身份证号：</span>
                            <span className="font-mono font-bold text-on-surface">
                              {kycIdCard.substring(0, 4) + '**********' + kycIdCard.substring(14)}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setKycVerified(false);
                            setKycRealName('');
                            setKycIdCard('');
                            localStorage.removeItem('settings_kyc_verified');
                            localStorage.removeItem('settings_kyc_real_name');
                            localStorage.removeItem('settings_kyc_id_card');
                            triggerToast('已清除实名核验状态');
                          }}
                          className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl font-headline text-[11px] font-bold cursor-pointer transition-colors"
                        >
                          解除当前实名认证
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-[11.5px] leading-relaxed text-on-surface-variant">
                          💡 <strong>为何需要实名？</strong><br />
                          根据互联网诊疗管理办法，中药代煎与代茶饮处方药寄递，必须绑定真实的实名信息，以便药师进行中药冲突避险与处方资质审核。
                        </div>

                        {/* Input form */}
                        <div className="space-y-3">
                          <div>
                            <label className="text-[11px] font-bold text-outline block mb-1">真实姓名</label>
                            <input
                              type="text"
                              value={kycRealName}
                              onChange={(e) => setKycRealName(e.target.value)}
                              className="bg-surface-container border border-outline-variant rounded-xl p-2.5 text-[12.5px] font-headline font-bold text-on-surface w-full focus:outline-none focus:border-primary"
                              placeholder="需与身份证姓名一致"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-outline block mb-1">身份证号</label>
                            <input
                              type="text"
                              maxLength={18}
                              value={kycIdCard}
                              onChange={(e) => setKycIdCard(e.target.value)}
                              className="bg-surface-container border border-outline-variant rounded-xl p-2.5 text-[12.5px] font-mono font-bold text-on-surface w-full focus:outline-none focus:border-primary"
                              placeholder="请输入18位中国大陆居民身份证"
                            />
                          </div>

                          {/* Quick fill buttons */}
                          <div className="flex gap-2 py-1 items-center">
                            <span className="text-[10px] text-outline font-bold">测试快捷填入:</span>
                            <button
                              type="button"
                              onClick={() => {
                                setKycRealName('张仲景');
                                setKycIdCard('411300198001011234');
                              }}
                              className="px-2.5 py-1 bg-surface-container-high rounded text-[11px] text-primary hover:bg-primary/5 cursor-pointer font-bold"
                            >
                              张仲景 (测试)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setKycRealName('李心悦');
                                setKycIdCard('330102199505202811');
                              }}
                              className="px-2.5 py-1 bg-surface-container-high rounded text-[11px] text-primary hover:bg-primary/5 cursor-pointer font-bold"
                            >
                              李心悦 (测试)
                            </button>
                          </div>

                          {/* Checkbox agreement */}
                          <label className="flex items-start gap-2 pt-1 cursor-pointer">
                            <input
                              type="checkbox"
                              defaultChecked={true}
                              id="agree-kyc-check"
                              className="mt-0.5"
                            />
                            <span className="text-[11px] text-outline leading-tight">
                              我同意授权本草平台对身份进行核验，并同意将处方所需实名数据用于药监区块链追溯。
                            </span>
                          </label>

                          {/* Submit Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const checkEl = document.getElementById('agree-kyc-check') as HTMLInputElement;
                              if (checkEl && !checkEl.checked) {
                                triggerToast('请先勾选并同意服务协议');
                                return;
                              }
                              if (!kycRealName.trim() || kycRealName.length < 2) {
                                triggerToast('请输入正确的真实姓名');
                                return;
                              }
                              if (kycIdCard.trim().length !== 18) {
                                triggerToast('请输入18位身份证号');
                                return;
                              }
                              
                              // Save to local
                              setKycVerified(true);
                              localStorage.setItem('settings_kyc_verified', 'true');
                              localStorage.setItem('settings_kyc_real_name', kycRealName);
                              localStorage.setItem('settings_kyc_id_card', kycIdCard);
                              triggerToast('🎉 实名身份核验通过，已锚定至本草链');
                            }}
                            className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-headline text-[12px] font-bold shadow-xs hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-[16px]">verified_user</span>
                            提交实名认证
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: Delivery Address Book Editing */}
                {settingsTab === 'address' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-surface-container-high pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                        <h4 className="font-headline font-bold text-[13px] text-primary">收货地址编辑</h4>
                      </div>
                      {!showAddressForm && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditAddressId(null);
                            setFormAddrName('');
                            setFormAddrPhone('');
                            setFormAddrRegion('河南省南阳市宛城区');
                            setFormAddrDetail('');
                            setFormAddrIsDefault(false);
                            setShowAddressForm(true);
                          }}
                          className="px-2.5 py-1 bg-primary text-on-primary rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs hover:opacity-90"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          新增地址
                        </button>
                      )}
                    </div>

                    {showAddressForm ? (
                      /* Address Creation/Modification Form */
                      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant space-y-4">
                        <h5 className="font-headline text-[12.5px] font-bold text-on-surface flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px] text-primary">edit_location</span>
                          {editAddressId ? '修改收货地址' : '添加全新收货地址'}
                        </h5>

                        <div className="space-y-3">
                          {/* Name */}
                          <div>
                            <label className="text-[11px] font-bold text-outline block mb-1">收货人姓名</label>
                            <input
                              type="text"
                              value={formAddrName}
                              onChange={(e) => setFormAddrName(e.target.value)}
                              className="bg-surface-container border border-outline-variant rounded-xl p-2.5 text-[12px] font-headline font-bold text-on-surface w-full focus:outline-none"
                              placeholder="姓名"
                            />
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="text-[11px] font-bold text-outline block mb-1">联系电话</label>
                            <input
                              type="tel"
                              value={formAddrPhone}
                              onChange={(e) => setFormAddrPhone(e.target.value)}
                              className="bg-surface-container border border-outline-variant rounded-xl p-2.5 text-[12px] font-mono font-bold text-on-surface w-full focus:outline-none"
                              placeholder="11位手机号码"
                            />
                          </div>

                          {/* Region select dropdown */}
                          <div>
                            <label className="text-[11px] font-bold text-outline block mb-1">所在地区</label>
                            <select
                              value={formAddrRegion}
                              onChange={(e) => setFormAddrRegion(e.target.value)}
                              className="bg-surface-container border border-outline-variant rounded-xl p-2.5 text-[12px] font-headline font-bold text-on-surface w-full focus:outline-none focus:border-primary cursor-pointer"
                            >
                              <option value="河南省南阳市宛城区">河南省南阳市宛城区 (张仲景故里)</option>
                              <option value="浙江省杭州市西湖区">浙江省杭州市西湖区</option>
                              <option value="四川省成都市青羊区">四川省成都市青羊区</option>
                              <option value="北京市东城区">北京市东城区</option>
                              <option value="广东省广州市荔湾区">广东省广州市荔湾区</option>
                              <option value="江苏省苏州市姑苏区">江苏省苏州市姑苏区</option>
                            </select>
                          </div>

                          {/* Detail */}
                          <div>
                            <label className="text-[11px] font-bold text-outline block mb-1">详细地址</label>
                            <input
                              type="text"
                              value={formAddrDetail}
                              onChange={(e) => setFormAddrDetail(e.target.value)}
                              className="bg-surface-container border border-outline-variant rounded-xl p-2.5 text-[12px] font-headline font-bold text-on-surface w-full focus:outline-none"
                              placeholder="街道、楼牌号等"
                            />
                          </div>

                          {/* Set Default */}
                          <label className="flex items-center gap-2 pt-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formAddrIsDefault}
                              onChange={(e) => setFormAddrIsDefault(e.target.checked)}
                              className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4"
                            />
                            <span className="text-[11.5px] text-on-surface font-semibold">设为默认收货地址</span>
                          </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddressForm(false)}
                            className="flex-1 py-2 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant text-outline font-headline text-[11.5px] font-bold text-center cursor-pointer transition-colors"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!formAddrName.trim()) {
                                triggerToast('请填写收货人姓名');
                                return;
                              }
                              if (formAddrPhone.trim().length < 7) {
                                triggerToast('请填写正确的联系电话');
                                return;
                              }
                              if (!formAddrDetail.trim()) {
                                triggerToast('请填写详细收货地址');
                                return;
                              }

                              let updatedList = [...addresses];
                              if (editAddressId) {
                                // Editing
                                updatedList = updatedList.map((addr) => {
                                  if (addr.id === editAddressId) {
                                    return {
                                      ...addr,
                                      name: formAddrName,
                                      phone: formAddrPhone,
                                      region: formAddrRegion,
                                      detail: formAddrDetail,
                                      isDefault: formAddrIsDefault,
                                    };
                                  }
                                  return addr;
                                });
                              } else {
                                // Adding
                                const newId = `addr-${Date.now()}`;
                                updatedList.push({
                                  id: newId,
                                  name: formAddrName,
                                  phone: formAddrPhone,
                                  region: formAddrRegion,
                                  detail: formAddrDetail,
                                  isDefault: formAddrIsDefault,
                                });
                              }

                              // Ensure only one isDefault is true
                              if (formAddrIsDefault) {
                                const targetId = editAddressId || updatedList[updatedList.length - 1].id;
                                updatedList = updatedList.map((addr) => ({
                                  ...addr,
                                  isDefault: addr.id === targetId,
                                }));
                              } else if (updatedList.filter(a => a.isDefault).length === 0) {
                                // Keep at least one default
                                if (updatedList.length > 0) {
                                  updatedList[0].isDefault = true;
                                }
                              }

                              // Save and notify
                              setAddresses(updatedList);
                              localStorage.setItem('settings_addresses', JSON.stringify(updatedList));
                              triggerToast('收货地址已成功保存');
                              setShowAddressForm(false);
                            }}
                            className="flex-grow py-2 rounded-xl bg-primary text-on-primary font-headline text-[11.5px] font-bold text-center cursor-pointer hover:opacity-90 transition-all"
                          >
                            保存并使用该地址
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Address list */
                      <div className="space-y-3">
                        {addresses.length === 0 ? (
                          <div className="text-center py-8 text-outline text-[12px]">
                            暂无收货地址，点击右上方“新增地址”开始。
                          </div>
                        ) : (
                          addresses.map((addr) => (
                            <div
                              key={addr.id}
                              className="bg-surface border border-outline-variant rounded-2xl p-4 space-y-3 shadow-xs relative"
                            >
                              <div className="flex justify-between items-baseline">
                                <div className="flex items-center gap-2">
                                  <span className="font-headline font-extrabold text-[13.5px] text-on-surface">
                                    {addr.name}
                                  </span>
                                  {addr.isDefault && (
                                    <span className="bg-primary/10 text-primary text-[9px] font-sans px-1.5 py-0.5 rounded font-extrabold">
                                      默认
                                    </span>
                                  )}
                                </div>
                                <span className="font-mono text-[12.5px] text-outline font-semibold">
                                  {addr.phone}
                                </span>
                              </div>

                              <p className="font-sans text-[12px] text-on-surface-variant leading-relaxed text-left">
                                <span className="font-semibold text-on-surface">{addr.region}</span> {addr.detail}
                              </p>

                              {/* Action buttons */}
                              <div className="flex justify-end gap-3.5 pt-2 border-t border-surface-container text-[11.5px]">
                                {!addr.isDefault && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = addresses.map((a) => ({
                                        ...a,
                                        isDefault: a.id === addr.id,
                                      }));
                                      setAddresses(updated);
                                      localStorage.setItem('settings_addresses', JSON.stringify(updated));
                                      triggerToast('默认地址更新成功');
                                    }}
                                    className="text-primary hover:underline font-bold cursor-pointer flex items-center gap-0.5"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">star_border</span>
                                    设为默认
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditAddressId(addr.id);
                                    setFormAddrName(addr.name);
                                    setFormAddrPhone(addr.phone);
                                    setFormAddrRegion(addr.region);
                                    setFormAddrDetail(addr.detail);
                                    setFormAddrIsDefault(addr.isDefault);
                                    setShowAddressForm(true);
                                  }}
                                  className="text-on-surface hover:text-primary hover:underline font-bold cursor-pointer flex items-center gap-0.5"
                                >
                                  <span className="material-symbols-outlined text-[14px]">edit</span>
                                  编辑
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm('确认删除该收货地址吗？')) {
                                      let updated = addresses.filter((a) => a.id !== addr.id);
                                      if (addr.isDefault && updated.length > 0) {
                                        updated[0].isDefault = true;
                                      }
                                      setAddresses(updated);
                                      localStorage.setItem('settings_addresses', JSON.stringify(updated));
                                      triggerToast('收货地址已成功删除');
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-700 hover:underline font-bold cursor-pointer flex items-center gap-0.5"
                                >
                                  <span className="material-symbols-outlined text-[14px]">delete</span>
                                  删除
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                        
                        <button
                          type="button"
                          onClick={() => {
                            setEditAddressId(null);
                            setFormAddrName('');
                            setFormAddrPhone('');
                            setFormAddrRegion('河南省南阳市宛城区');
                            setFormAddrDetail('');
                            setFormAddrIsDefault(false);
                            setShowAddressForm(true);
                          }}
                          className="w-full py-3.5 border-2 border-dashed border-outline-variant hover:border-primary rounded-2xl flex items-center justify-center gap-2 text-[12px] font-headline font-bold text-outline hover:text-primary transition-all cursor-pointer bg-surface/50 hover:bg-primary/5"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_location</span>
                          ➕ 新增收货地址
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Footnotes */}
                <div className="pt-4 text-center">
                  <p className="font-headline text-[11px] font-bold text-outline">本草数智草本健康系统 (TCM-Digital Platform)</p>
                  <p className="font-sans text-[9.5px] text-outline/70 mt-1">版本号：v2.5.4 | 区块链安全审计级别：A级</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
