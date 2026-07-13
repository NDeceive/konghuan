/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenType, HerbProduct } from '../types';
import { PRODUCTS } from '../data/mockData';

interface ShopScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onSelectProductById: (id: string) => void;
  onAddToCart: (product: HerbProduct) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  onNavigate,
  onSelectProductById,
  onAddToCart,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = ['全部', '补气', '滋阴', '温阳', '清热'];

  const hotKeywords = ['黄芪', '枸杞', '山药', '野山参'];

  const handleProductClick = (id: string) => {
    onSelectProductById(id);
    onNavigate('PRODUCT_DETAIL');
  };

  const handleAddToCart = (e: React.MouseEvent, product: HerbProduct) => {
    e.stopPropagation();
    onAddToCart(product);
    showToast(`已成功将「${product.name}」加入方剂包！`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Filtering products
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesSearch = product.name.includes(search) || 
                          product.description.includes(search) || 
                          product.origin.includes(search);
    
    const matchesCategory = activeCategory === '全部' || 
                            product.tags.some(tag => tag.includes(activeCategory)) ||
                            product.description.includes(activeCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-background text-on-background font-body min-h-screen pt-20 pb-28">
      <main className="px-5 max-w-lg mx-auto md:max-w-4xl flex flex-col gap-5 animate-fade-in">
        
        {/* Search header & hot terms */}
        <section className="space-y-3">
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-outline material-symbols-outlined text-[20px]">search</span>
            <input 
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索道地药材，如：黄芪、中宁枸杞..."
              className="w-full bg-surface-container-lowest border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl py-3 pl-10 pr-10 text-[14px] outline-none transition-colors shadow-sm h-11"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 p-1 rounded-full text-outline hover:text-on-surface cursor-pointer flex items-center justify-center"
                aria-label="清空搜索"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[11px] font-bold text-outline whitespace-nowrap">热门搜索:</span>
            {hotKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => setSearch(kw)}
                className="px-2.5 py-1 bg-surface border border-outline-variant hover:border-primary hover:text-primary rounded-full text-[11px] font-sans text-on-surface transition-all cursor-pointer whitespace-nowrap"
              >
                {kw}
              </button>
            ))}
          </div>
        </section>

        {/* Category filters */}
        <section className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-surface-container-high">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl font-headline text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-primary text-on-primary shadow-sm scale-102'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Product Cards Grid */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              onClick={() => handleProductClick(product.id)}
              className="bg-surface-container-lowest rounded-2xl overflow-hidden border border-surface-container-low ambient-shadow flex flex-col justify-between hover:border-tertiary-fixed-dim/40 cursor-pointer group transition-all duration-250 hover:scale-[1.01]"
            >
              {/* Product Visual Container */}
              <div className="relative h-32 md:h-40 w-full overflow-hidden bg-surface-container">
                <img 
                  referrerPolicy="no-referrer"
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-primary-container shadow-xs">
                  <span className="material-symbols-outlined text-[10px] text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="text-[9px] text-white font-medium">AI数字护照</span>
                </div>
              </div>

              {/* Product Metadata */}
              <div className="p-3 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-1 mb-1">
                    <h4 className="font-headline text-[13.5px] font-bold text-on-surface line-clamp-1 leading-tight">
                      {product.name}
                    </h4>
                    <span className="text-[9px] bg-secondary-container text-primary font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                      {product.origin.split('·')[1] || product.origin}
                    </span>
                  </div>
                  
                  <p className="font-sans text-[11px] text-outline line-clamp-1 mb-2">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="material-symbols-outlined text-amber-500 text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-sans text-[10px] font-bold text-on-surface">{product.rating}</span>
                    <span className="text-[9px] text-outline font-medium">| {product.origin}</span>
                  </div>
                </div>

                <div className="flex items-end justify-between mt-1">
                  <div className="flex items-baseline gap-0.5">
                    <span className="font-sans text-[11px] text-primary">¥</span>
                    <span className="font-headline text-[16px] font-bold text-primary">{product.price}</span>
                    {product.originalPrice && (
                      <span className="font-sans text-[10px] text-outline line-through ml-1">¥{product.originalPrice}</span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => handleAddToCart(e, product)}
                    className="w-8 h-8 rounded-lg bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                    aria-label="加入购物车"
                    title="加入方剂包"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-2 md:col-span-3 text-center py-16 space-y-2">
              <span className="material-symbols-outlined text-[48px] text-outline/50">hourglass_empty</span>
              <p className="font-headline text-[14px] text-on-surface-variant font-medium">没有找到符合搜索的道地药材</p>
              <p className="font-sans text-[11.5px] text-outline">试着缩短关键字或切换其他调理分类</p>
            </div>
          )}
        </section>
      </main>

      {/* Floating Cart & checkout button */}
      <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg md:max-w-2xl px-5 flex justify-end pointer-events-none">
        <button 
          onClick={() => onNavigate('CONFIRM_ORDER')}
          className="pointer-events-auto bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container px-5 py-3 rounded-full shadow-[0_8px_24px_rgba(1,45,29,0.2)] flex items-center gap-2 cursor-pointer transition-all active:scale-97"
        >
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_bag</span>
          <span className="font-headline text-[13px] font-bold">整理方剂，去结算</span>
        </button>
      </div>

      {/* Success Toast banner */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-inverse-surface text-inverse-on-surface rounded-xl font-sans text-[12.5px] shadow-lg flex items-center gap-1.5 border border-outline/20">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
