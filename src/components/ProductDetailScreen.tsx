/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenType, HerbProduct } from '../types';

interface ProductDetailScreenProps {
  product: HerbProduct;
  onNavigate: (screen: ScreenType) => void;
  onAddToCart: (product: HerbProduct) => void;
  onBuyImmediately: (product: HerbProduct) => void;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  product,
  onNavigate,
  onAddToCart,
  onBuyImmediately,
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddToCart = () => {
    onAddToCart(product);
    showToast(`已成功将「${product.name}」加入方剂包！`);
  };

  const handleBuyNow = () => {
    onBuyImmediately(product);
    onNavigate('CONFIRM_ORDER');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const passport = product.digitalPassport;

  return (
    <div className="bg-background text-on-background font-body min-h-screen pt-20 pb-28">
      <main className="px-5 max-w-lg mx-auto md:max-w-2xl flex flex-col gap-6 animate-fade-in">
        
        {/* Product Hero Photo */}
        <section className="relative overflow-hidden rounded-2xl border border-surface-container bg-surface-container-lowest">
          <img 
            referrerPolicy="no-referrer"
            src={product.image} 
            alt={product.name}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 right-4 bg-primary/95 text-white backdrop-blur-md font-headline text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-primary-container">
            <span className="material-symbols-outlined text-[14px] text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            区块链数字护照确权
          </div>

          <div className="p-5">
            <div className="flex justify-between items-baseline mb-2">
              <div className="flex items-baseline gap-1">
                <span className="font-sans text-[14px] font-bold text-primary">¥</span>
                <span className="font-headline text-[26px] font-bold text-primary">{product.price}</span>
                {product.originalPrice && (
                  <span className="font-sans text-[12px] text-outline line-through ml-2">¥{product.originalPrice}</span>
                )}
              </div>
              <span className="font-sans text-[11px] bg-secondary-container text-primary font-bold px-2.5 py-1 rounded-full border border-secondary-fixed-dim/20">
                产地直采：{product.origin}
              </span>
            </div>

            <h2 className="font-headline text-[20px] font-bold text-on-surface mb-1">{product.name}</h2>
            {product.latinName && (
              <p className="font-mono text-[11px] text-outline italic mb-3">{product.latinName}</p>
            )}
            
            <p className="font-sans text-[13.5px] text-on-surface-variant leading-relaxed text-justify mb-4">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-1.5">
              {product.tags.map((tag, idx) => (
                <span key={idx} className="font-sans text-[10.5px] font-semibold bg-surface-container-high text-on-surface px-2.5 py-1 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Digital Passport Cert Box */}
        {passport && (
          <section className="bg-surface-container-lowest rounded-2xl p-5 border border-tertiary-fixed-dim/45 shadow-ambient relative overflow-hidden">
            {/* Background luxury watermark */}
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-tertiary-fixed opacity-15 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start border-b border-surface-container pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <div>
                    <h3 className="font-headline text-[15px] font-bold text-on-surface">中药材道地数字护照</h3>
                    <span className="text-[9.5px] text-tertiary font-medium bg-tertiary-container/30 px-1.5 py-0.5 rounded-md border border-tertiary/10">
                      联盟区块链存证确权
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-sans text-[10px] text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold block">
                    检测合格 (Passed)
                  </span>
                </div>
              </div>

              {/* Passport Cert Data */}
              <div className="bg-surface rounded-xl p-4 border border-outline-variant/60 space-y-3 mb-5">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-headline text-outline font-semibold">数字身份 (UID):</span>
                  <span className="font-mono text-on-surface font-semibold select-all bg-surface-container px-2 py-0.5 rounded">{passport.id}</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-headline text-outline font-semibold">生产批次号 (Batch):</span>
                  <span className="font-sans text-on-surface font-semibold bg-surface-container px-2 py-0.5 rounded">{passport.batchNo}</span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-headline text-outline font-semibold">哈希摘要 (Hash):</span>
                  <span className="font-mono text-on-surface text-[10.5px] max-w-[200px] truncate select-all bg-surface-container px-2 py-0.5 rounded" title={passport.blockHash}>
                    {passport.blockHash}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-headline text-outline font-semibold">上链锚定时间:</span>
                  <span className="font-sans text-on-surface text-[11px] font-medium">{passport.timestamp}</span>
                </div>
              </div>

              {/* Real-time timeline list */}
              <div className="space-y-4">
                <span className="text-[11px] font-bold text-outline block mb-1">道地中草药全链路生命轨迹:</span>
                
                <div className="relative border-l-1.5 border-dashed border-outline-variant/80 pl-6 ml-3 space-y-5">
                  {passport.timeline.map((step) => (
                    <div key={step.id} className="relative">
                      {/* Timeline icon node */}
                      <div className="absolute -left-[35px] top-0 w-6 h-6 rounded-full bg-surface-container-high border-1.5 border-primary flex items-center justify-center text-primary shadow-xs z-10">
                        <span className="material-symbols-outlined text-[14px]">{step.icon}</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-headline text-[13px] font-bold text-on-surface">{step.title}</span>
                          <span className="font-sans text-[10px] text-outline">{step.time}</span>
                        </div>
                        <p className="font-sans text-[12px] text-on-surface-variant leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Traditional medicine usage directions card */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm">
          <h4 className="font-headline text-[14px] font-bold text-on-surface mb-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-primary text-[18px]">info_outline</span>
            服用方式及保存说明
          </h4>
          <ul className="space-y-2 font-sans text-[12.5px] text-on-surface-variant leading-normal">
            <li><strong>食用方法：</strong>本品为特级饮片，洗净后可直接煎服、磨粉或置于保温杯中用沸水泡代茶饮。</li>
            <li><strong>推荐用量：</strong>日常调理煎服一日5g-15g；若有严重亚健康，请遵医嘱。</li>
            <li><strong>存储禁忌：</strong>置于干燥阴凉处密封保存，防霉防蛀。一经开封，建议置于冰箱冷藏更佳。</li>
          </ul>
        </section>
      </main>

      {/* Fixed Sticky Actions bar */}
      <div className="fixed bottom-0 left-0 w-full glass-panel px-5 py-3 pb-safe z-45">
        <div className="max-w-lg mx-auto md:max-w-2xl flex gap-3">
          {/* Consulting button */}
          <button 
            onClick={() => onNavigate('ASSESSMENT_RESULTS')}
            className="px-4 py-3 rounded-xl border border-outline bg-surface text-on-surface hover:bg-surface-container-low flex flex-col items-center justify-center cursor-pointer flex-shrink-0"
            title="在线咨询AI助手"
          >
            <span className="material-symbols-outlined text-[18px] text-primary">chat_bubble</span>
            <span className="font-headline text-[10px] font-medium mt-0.5">咨询AI</span>
          </button>

          {/* Add to prescription cart */}
          <button 
            id="btn-add-to-cart-detail"
            onClick={handleAddToCart}
            className="flex-1 py-3 rounded-xl border-1.5 border-primary text-primary font-headline text-[13px] font-bold flex justify-center items-center gap-1.5 transition-colors cursor-pointer hover:bg-primary/5 active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            加入方剂包
          </button>

          {/* Buy Immediately */}
          <button 
            id="btn-buy-now-detail"
            onClick={handleBuyNow}
            className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-headline text-[13px] font-bold flex justify-center items-center gap-1.5 transition-all shadow-md hover:bg-primary-container hover:text-on-primary-container cursor-pointer active:scale-98"
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            一键下单
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-inverse-surface text-inverse-on-surface rounded-xl font-sans text-[12.5px] shadow-lg flex items-center gap-1.5 border border-outline/20">
          <span className="material-symbols-outlined text-primary-fixed-dim text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
