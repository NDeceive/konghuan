/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenType, DietRecipe, HerbProduct } from '../types';
import { PRODUCTS } from '../data/mockData';

interface DietDetailScreenProps {
  recipe: DietRecipe;
  onNavigate: (screen: ScreenType) => void;
  onSelectProductById: (id: string) => void;
}

export const DietDetailScreen: React.FC<DietDetailScreenProps> = ({
  recipe,
  onNavigate,
  onSelectProductById,
}) => {
  const [isFavorited, setIsFavorited] = useState(false);

  // Find linked product if exists
  const linkedProduct = recipe.linkedProductId 
    ? PRODUCTS.find(p => p.id === recipe.linkedProductId)
    : PRODUCTS[0]; // fallback

  const handleProductClick = () => {
    if (linkedProduct) {
      onSelectProductById(linkedProduct.id);
      onNavigate('PRODUCT_DETAIL');
    }
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen pt-20 pb-28">
      <main className="px-5 max-w-lg mx-auto md:max-w-2xl flex flex-col gap-6 animate-fade-in">
        {/* Recipe Image & Title Header */}
        <section className="relative overflow-hidden rounded-2xl border border-surface-container shadow-sm bg-surface-container-lowest">
          <img 
            referrerPolicy="no-referrer"
            src={recipe.image} 
            alt={recipe.name}
            className="h-56 w-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-primary text-on-primary font-sans text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
            {recipe.benefits[0]}
          </div>

          <div className="p-5">
            <h2 className="font-headline text-[22px] font-bold text-primary mb-1.5">{recipe.name}</h2>
            <div className="flex gap-2 mb-3">
              {recipe.benefits.map((b, idx) => (
                <span key={idx} className="bg-secondary-container text-on-secondary-container font-sans text-[11px] font-semibold px-2.5 py-0.5 rounded-md">
                  {b}
                </span>
              ))}
            </div>
            <p className="font-sans text-[13.5px] text-on-surface-variant leading-relaxed text-justify">
              {recipe.description}
            </p>
          </div>
        </section>

        {/* Ingredients Bento Grid */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm">
          <h3 className="font-headline text-[15px] text-on-surface font-bold mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
            药膳食材精选配比
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {recipe.ingredients.map((ing, idx) => (
              <div 
                key={idx} 
                className={`p-3 rounded-xl border flex flex-col justify-between shadow-xs ${
                  ing.type === 'herb' 
                    ? 'border-tertiary-fixed-dim/30 bg-tertiary-container/10' 
                    : 'border-outline-variant/60 bg-surface'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-headline text-[13.5px] font-bold text-on-surface">{ing.name}</span>
                    <span className="font-sans text-[11px] text-primary font-semibold">{ing.quantity}</span>
                  </div>
                  {ing.benefit && (
                    <span className="text-[10px] text-tertiary-container font-medium mt-1.5 block">
                      功效：{ing.benefit}
                    </span>
                  )}
                </div>
                {ing.type === 'herb' && (
                  <span className="text-[9px] bg-tertiary-container/30 text-tertiary px-1.5 py-0.5 rounded-full inline-block mt-2 self-start font-medium scale-90 -ml-1">
                    道地中药
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Cooking Steps (Numbered) */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm">
          <h3 className="font-headline text-[15px] text-on-surface font-bold mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-primary">menu_book</span>
            烹饪步骤说明
          </h3>

          <div className="space-y-4">
            {recipe.steps.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-secondary-container text-primary font-headline text-[12px] font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <p className="font-sans text-[13px] text-on-surface-variant leading-relaxed text-justify">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Suitable & Unsuitable Lists */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Suitable */}
          <div className="bg-emerald-500/5 rounded-2xl p-5 border border-emerald-500/10 shadow-sm">
            <h4 className="font-headline text-[14px] font-bold text-emerald-800 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
              适宜人群
            </h4>
            <ul className="space-y-2">
              {recipe.suitable.map((item, idx) => (
                <li key={idx} className="font-sans text-[12px] text-emerald-900 leading-normal flex items-start gap-1">
                  <span className="mt-1 flex-shrink-0 w-1 h-1 rounded-full bg-emerald-600"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Unsuitable */}
          <div className="bg-red-500/5 rounded-2xl p-5 border border-red-500/10 shadow-sm">
            <h4 className="font-headline text-[14px] font-bold text-red-800 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-red-600">cancel</span>
              忌用人群
            </h4>
            <ul className="space-y-2">
              {recipe.unsuitable.map((item, idx) => (
                <li key={idx} className="font-sans text-[12px] text-red-900 leading-normal flex items-start gap-1">
                  <span className="mt-1 flex-shrink-0 w-1 h-1 rounded-full bg-red-600"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Linked Herb Product Card */}
        {linkedProduct && (
          <section className="bg-surface-container-lowest rounded-2xl p-4 border border-tertiary-fixed-dim/30 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-primary bg-primary-fixed px-2.5 py-0.5 rounded-full inline-block">
                药膳严选材料推荐
              </span>
              <span className="text-[11px] text-outline font-medium">产地自营 · 品质可信</span>
            </div>

            <div 
              onClick={handleProductClick}
              className="flex gap-4 cursor-pointer hover:bg-surface-container-low p-2 rounded-xl transition-colors"
            >
              <img 
                referrerPolicy="no-referrer"
                src={linkedProduct.image} 
                alt={linkedProduct.name}
                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-grow flex flex-col justify-between py-0.5">
                <div>
                  <h5 className="font-headline text-[14px] text-on-surface font-bold leading-none mb-1">
                    {linkedProduct.name}
                  </h5>
                  <p className="font-sans text-[11.5px] text-on-surface-variant line-clamp-2">
                    {linkedProduct.description}
                  </p>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-headline text-[15px] font-bold text-primary">¥{linkedProduct.price}</span>
                  <span className="font-sans text-[10px] text-primary hover:underline font-bold flex items-center">
                    查看护照及溯源 <span className="material-symbols-outlined text-[12px] ml-0.5">arrow_forward</span>
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom Actions Bar */}
      <div className="fixed bottom-0 left-0 w-full glass-panel px-5 py-3 pb-safe z-40">
        <div className="max-w-lg mx-auto md:max-w-2xl flex gap-3">
          <button 
            onClick={() => setIsFavorited(!isFavorited)}
            className={`px-5 py-3 rounded-xl border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isFavorited 
                ? 'bg-amber-100 border-amber-300 text-amber-700' 
                : 'bg-surface border-outline text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isFavorited ? "'FILL' 1" : "'FILL' 0" }}>
              star
            </span>
            <span className="font-headline text-[13px] font-semibold">{isFavorited ? '已收藏' : '收藏药膳'}</span>
          </button>
          
          <button 
            onClick={() => onNavigate('SHOP')}
            className="flex-grow py-3 rounded-xl bg-primary text-on-primary font-headline text-[13px] font-bold flex justify-center items-center gap-2 shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer active:scale-99"
          >
            <span className="material-symbols-outlined text-[18px]">local_pharmacy</span>
            前往道地商城抓药
          </button>
        </div>
      </div>
    </div>
  );
};
