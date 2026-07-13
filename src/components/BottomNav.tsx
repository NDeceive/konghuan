/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ScreenType } from '../types';

interface BottomNavProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate, cartCount }) => {
  const hiddenOn = ['LOGIN', 'CONFIRM_ORDER', 'STEPPER'];
  if (hiddenOn.includes(currentScreen)) return null;

  const tabs = [
    { id: 'HOME', label: '首页', icon: 'home', filledIcon: 'home' },
    { id: 'ASSESSMENT_RESULTS', label: '健康评估', icon: 'health_and_safety', filledIcon: 'health_and_safety' },
    { id: 'AI_ADVICE', label: 'AI 建议', icon: 'psychology', filledIcon: 'psychology' }, // Custom sub-section in results / home
    { id: 'SHOP', label: '道地商城', icon: 'local_pharmacy', filledIcon: 'local_pharmacy' },
    { id: 'PROFILE', label: '我的', icon: 'person', filledIcon: 'person' },
  ];

  // Helper to determine active tab based on screen
  const getActiveTab = () => {
    if (currentScreen === 'HOME') return 'HOME';
    if (currentScreen === 'ASSESSMENT_RESULTS') return 'ASSESSMENT_RESULTS';
    if (currentScreen === 'SHOP' || currentScreen === 'PRODUCT_DETAIL') return 'SHOP';
    if (currentScreen === 'PROFILE') return 'PROFILE';
    return '';
  };

  const activeTab = getActiveTab();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-45 flex justify-around items-center px-4 py-2 pb-safe bg-surface/90 backdrop-blur-lg border-t border-surface-container shadow-[0_-4px_12px_rgba(1,45,29,0.04)] rounded-t-xl transition-all duration-300">
      {tabs.map((tab) => {
        // SPECIAL AI ADVICE routing: let's route it or trigger it
        const isActive = activeTab === tab.id || (tab.id === 'AI_ADVICE' && currentScreen === 'ASSESSMENT_RESULTS');
        
        const handleClick = () => {
          if (tab.id === 'AI_ADVICE') {
            // Take to Assessment results screen, with AI chat anchored or focused!
            onNavigate('ASSESSMENT_RESULTS');
            // We can also trigger state update or scroll
            setTimeout(() => {
              const el = document.getElementById('ai-advisor-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          } else {
            onNavigate(tab.id as ScreenType);
          }
        };

        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id.toLowerCase()}`}
            onClick={handleClick}
            className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-full transition-all duration-200 cursor-pointer ${
              isActive 
                ? 'bg-secondary-container text-primary font-semibold scale-102 shadow-sm' 
                : 'text-on-surface-variant hover:text-primary scale-100 active:scale-95'
            }`}
          >
            <div className="relative">
              <span 
                className="material-symbols-outlined text-[24px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
              >
                {isActive ? tab.filledIcon : tab.icon}
              </span>
              {tab.id === 'SHOP' && cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-error-container text-on-error-container text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-1.5 border-surface">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-wide font-headline">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
