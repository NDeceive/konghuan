/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScreenType, UserProfile } from '../types';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  userProfile?: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({ currentScreen, onNavigate, userProfile }) => {
  const isHomeOrMain = 
    currentScreen === 'HOME' || 
    currentScreen === 'SHOP' || 
    currentScreen === 'PROFILE' || 
    currentScreen === 'ASSESSMENT_RESULTS';

  const getTitle = () => {
    switch (currentScreen) {
      case 'LOGIN': return '登录 - 本草智联';
      case 'HOME': return '本草智联';
      case 'STEPPER': return '完善健康档案';
      case 'ASSESSMENT_RESULTS': return 'AI 健康评估结果';
      case 'RISK_DETAILS': return '药食风险详情';
      case 'DIET_DETAIL': return '节气药膳推荐';
      case 'SHOP': return '道地商城';
      case 'PRODUCT_DETAIL': return '产品详情';
      case 'CONFIRM_ORDER': return '确认订单';
      case 'PROFILE': return '我的';
      default: return '本草智联';
    }
  };

  if (currentScreen === 'LOGIN') return null;

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-5 py-3 bg-surface/85 backdrop-blur-md border-b border-surface-container shadow-sm transition-all duration-300">
      <div className="flex items-center gap-1">
        {!isHomeOrMain ? (
          <button 
            id="btn-back"
            onClick={() => onNavigate('HOME')}
            className="p-1.5 -ml-1 text-on-surface hover:bg-surface-container rounded-full transition-colors flex items-center justify-center cursor-pointer"
            aria-label="返回"
          >
            <span className="material-symbols-outlined font-light text-[22px]">arrow_back</span>
          </button>
        ) : (
          <button 
            id="btn-menu"
            className="p-1.5 -ml-1 text-on-surface hover:bg-surface-container rounded-full transition-colors flex items-center justify-center cursor-pointer"
            aria-label="菜单"
          >
            <span className="material-symbols-outlined font-light text-[22px]">menu</span>
          </button>
        )}
      </div>

      <h1 className="font-headline font-semibold text-[18px] text-primary tracking-tight flex items-center gap-1.5">
        {isHomeOrMain && (
          <span className="material-symbols-outlined text-[20px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
        )}
        {getTitle()}
      </h1>

      <div className="flex items-center gap-2">
        {userProfile && userProfile.role !== 'CONSUMER' && (
          <span className="text-[10px] bg-tertiary-container/30 text-tertiary font-medium px-2 py-0.5 rounded-full border border-tertiary-fixed-dim/20">
            {userProfile.role === 'ADMIN' ? '管理员' : '合作商户'}
          </span>
        )}
        <button 
          id="btn-scanner"
          onClick={() => onNavigate('STEPPER')}
          className="p-1.5 -mr-1 text-on-surface hover:bg-surface-container rounded-full transition-colors flex items-center justify-center cursor-pointer"
          aria-label="扫码"
          title="完善健康档案 / 扫一扫"
        >
          <span className="material-symbols-outlined font-light text-[22px]">qr_code_scanner</span>
        </button>
      </div>
    </header>
  );
};
