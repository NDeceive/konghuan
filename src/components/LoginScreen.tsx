/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserRole, UserProfile } from '../types';
import { INITIAL_USER } from '../data/mockData';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('CONSUMER');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = () => {
    if (!phone || phone.length < 11) {
      showToast('请输入正确的11位手机号码');
      return;
    }
    const val = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(val);
    setCountdown(60);
    showToast(`【验证码已发送】您的短信验证码为: ${val}`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 11) {
      showToast('请输入正确的11位手机号码');
      return;
    }
    if (!code) {
      showToast('请输入验证码');
      return;
    }
    if (code !== generatedCode && code !== '1234' && code !== '8888') {
      showToast('验证码不正确，请重新输入');
      return;
    }

    // Set custom user (always CONSUMER role)
    const memberLabel = '普通会员 (Ordinary Member)';
    const avatarImg = INITIAL_USER.avatar;
    const userName = '李心悦';

    const finalProfile: UserProfile = {
      name: userName,
      phone: phone,
      role: 'CONSUMER',
      avatar: avatarImg,
      memberStatus: memberLabel,
      favoritesCount: 12,
      couponsCount: 3,
      footprintsCount: 48,
    };

    onLoginSuccess(finalProfile);
  };

  return (
    <div id="login-container" className="bg-surface text-on-surface antialiased min-h-screen flex flex-col relative overflow-hidden selection:bg-tertiary-fixed selection:text-on-tertiary-fixed">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low via-surface to-secondary-container opacity-50"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-tertiary-fixed-dim opacity-10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-fixed opacity-20 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' /%3E%3C/svg%3E")` }}></div>
      </div>

      {/* Main Content Container */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-5 md:p-12 w-full max-w-[1200px] mx-auto">
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-[80px]">
          
          {/* Branding / Intro Section */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-2">
              <span className="material-symbols-outlined text-[48px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
              <h1 className="font-headline font-bold text-[32px] text-primary tracking-tight">颐膳坊</h1>
            </div>
            <h2 className="font-headline font-semibold text-[22px] md:text-[26px] text-on-surface-variant max-w-lg leading-tight">
              AI 赋能中医健康辅助与<br/>道地药材可信直供
            </h2>
            <p className="font-body text-[15px] md:text-[16px] text-outline max-w-md hidden md:block mt-4 leading-relaxed">
              融汇传统中医智慧与现代智能科技，为您提供全方位的健康管理与可溯源的道地药材服务，构建纯净、权威的康养生态。
            </p>

            {/* Decorative elements for large screens */}
            <div className="hidden lg:flex items-center space-x-3 mt-12 opacity-80">
              <div className="flex items-center space-x-1 bg-surface-container-high rounded-full px-3 py-1.5 border border-surface-container-highest">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">verified</span>
                <span className="font-sans text-[12px] font-medium text-on-surface-variant">权威认证</span>
              </div>
              <div className="flex items-center space-x-1 bg-surface-container-high rounded-full px-3 py-1.5 border border-surface-container-highest">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">psychology</span>
                <span className="font-sans text-[12px] font-medium text-on-surface-variant">AI 分析</span>
              </div>
              <div className="flex items-center space-x-1 bg-surface-container-high rounded-full px-3 py-1.5 border border-surface-container-highest">
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">local_pharmacy</span>
                <span className="font-sans text-[12px] font-medium text-on-surface-variant">道地直供</span>
              </div>
            </div>
          </div>

          {/* Login / Role Selection Card */}
          <div className="w-full max-w-[480px] lg:w-1/2 bg-surface-container-lowest/85 backdrop-blur-md rounded-2xl p-6 md:p-10 flex flex-col space-y-6 relative overflow-hidden border border-tertiary-fixed/30 shadow-[0_8px_32px_0_rgba(1,45,29,0.05)]">
            {/* Subtle top border accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-tertiary-fixed-dim to-primary-fixed-dim"></div>
            
            <div className="text-center mb-2">
              <h3 className="font-headline font-semibold text-[22px] text-on-surface">欢迎登录</h3>
              <p className="font-body text-[13px] text-outline mt-1.5">请输入您的手机号验证登录</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Phone Input */}
              <div className="space-y-1.5">
                <label className="font-sans text-[13px] font-medium text-on-surface-variant block" htmlFor="phone">手机号码</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-outline material-symbols-outlined text-[20px]">smartphone</span>
                  <span className="absolute left-[38px] text-on-surface-variant font-medium text-[14px] border-r border-outline-variant pr-2">+86</span>
                  <input 
                    id="phone"
                    type="tel"
                    maxLength={11}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-[88px] pr-3 text-[15px] text-on-surface focus:outline-none focus:ring-1.5 focus:ring-primary focus:border-primary transition-all placeholder:text-outline/50 h-[48px]"
                    placeholder="请输入手机号"
                    required
                  />
                </div>
              </div>

              {/* Verification Code Input */}
              <div className="space-y-1.5">
                <label className="font-sans text-[13px] font-medium text-on-surface-variant block" htmlFor="code">验证码</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-outline material-symbols-outlined text-[20px]">lock</span>
                  <input 
                    id="code"
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 pl-10 pr-[110px] text-[15px] text-on-surface focus:outline-none focus:ring-1.5 focus:ring-primary focus:border-primary transition-all placeholder:text-outline/50 h-[48px]"
                    placeholder="请输入验证码"
                    required
                  />
                  <button 
                    id="btn-send-code"
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 font-sans text-[12px] font-medium text-primary bg-secondary-fixed/50 hover:bg-secondary-fixed px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? `${countdown}秒后重新获取` : '获取验证码'}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  id="btn-login-submit"
                  type="submit"
                  className="w-full h-[52px] bg-primary hover:bg-primary-container text-on-primary font-headline font-semibold text-[16px] rounded-xl shadow-[0_4px_12px_rgba(1,45,29,0.15)] transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>进入平台</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <p className="font-sans text-[11px] text-outline leading-normal">
                登录即代表同意 <a className="text-primary hover:underline font-medium" href="#agreement">用户协议</a> 与 <a className="text-primary hover:underline font-medium" href="#privacy">隐私政策</a>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Toast Alert for verification code or verification */}
      {toastMessage && (
        <div id="login-toast" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-55 px-5 py-3 bg-inverse-surface text-inverse-on-surface rounded-xl font-sans text-[13px] shadow-lg flex items-center gap-2 max-w-[90%] border border-outline/30 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-primary-fixed-dim">info</span>
          <span className="leading-snug">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
