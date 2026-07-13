/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenType, OrderItem } from '../types';

interface OrderConfirmationScreenProps {
  cart: OrderItem[];
  onNavigate: (screen: ScreenType) => void;
  onClearCart: () => void;
  onIncrementFootprints: () => void;
  onUpdateQuantity: (productId: string, qty: number) => void;
}

export const OrderConfirmationScreen: React.FC<OrderConfirmationScreenProps> = ({
  cart,
  onNavigate,
  onClearCart,
  onIncrementFootprints,
  onUpdateQuantity,
}) => {
  const [shipping, setShipping] = useState<'EXPRESS' | 'SELF_PICKUP'>('EXPRESS');
  const [payment, setPayment] = useState<'WECHAT' | 'ALIPAY' | 'INSURANCE'>('WECHAT');
  const [note, setNote] = useState('');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  
  // Addresses States
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
  const [selectedAddrId, setSelectedAddrId] = useState<string>('addr-1');
  const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('settings_addresses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAddresses(parsed);
          const def = parsed.find(a => a.isDefault) || parsed[0];
          setSelectedAddrId(def.id);
        }
      } catch (e) {
        console.error('Failed to parse addresses', e);
      }
    }
  }, []);

  const activeAddress = addresses.find(a => a.id === selectedAddrId) || addresses[0];

  // Calculate costs
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = subtotal > 150 ? 20 : 0;
  const shippingCost = shipping === 'EXPRESS' ? 0 : 0; // Free for medicinal wellness
  const total = Math.max(subtotal - discount + shippingCost, 0);

  const handleSubmitOrder = () => {
    if (cart.length === 0) return;
    
    // Generate order ID
    const oid = `BCT-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedOrderId(oid);
    setIsSuccessModalOpen(true);

    // Increment user footprints & clear cart
    onIncrementFootprints();
  };

  const handleCloseModalAndGoHome = () => {
    setIsSuccessModalOpen(false);
    onClearCart();
    onNavigate('HOME');
  };

  return (
    <div className="bg-background text-on-background font-body min-h-screen pt-20 pb-32">
      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-5">
          <div className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full border border-tertiary-fixed-dim/35 shadow-2xl text-center space-y-4 animate-scale-up">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            
            <div>
              <h3 className="font-headline font-bold text-[18px] text-primary">模拟订单提交成功！</h3>
              <p className="font-sans text-[12px] text-outline mt-1.5 leading-relaxed">
                中药材专属智能合约已触发。本草区块链已完成数字身份登记与防伪标签确权锚定。
              </p>
            </div>

            <div className="bg-surface border border-outline-variant rounded-xl p-3 text-left space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-headline text-outline font-semibold">存证单号:</span>
                <span className="font-mono text-on-surface font-semibold">{generatedOrderId}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="font-headline text-outline font-semibold">支付金额:</span>
                <span className="font-sans text-primary font-bold">¥{total}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="font-headline text-outline font-semibold">快递承运:</span>
                <span className="font-sans text-on-surface">顺丰道地专配</span>
              </div>
            </div>

            <button
              onClick={handleCloseModalAndGoHome}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-headline text-[13px] font-bold shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer"
            >
              签署区块链回单，返回首页
            </button>
          </div>
        </div>
      )}

      {/* Address Switcher Modal */}
      {isAddrModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-55 flex items-center justify-center p-5">
          <div className="bg-surface-container-lowest rounded-2xl p-5 max-w-sm w-full border border-outline-variant shadow-2xl text-left space-y-4 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-surface-container">
              <h3 className="font-headline font-bold text-[15px] text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                选择收货地址
              </h3>
              <button 
                onClick={() => setIsAddrModalOpen(false)}
                className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant text-[12px] font-bold cursor-pointer hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
              {addresses.map((addr) => (
                <div 
                  key={addr.id}
                  onClick={() => {
                    setSelectedAddrId(addr.id);
                    setIsAddrModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-[12.5px] ${
                    selectedAddrId === addr.id 
                      ? 'bg-primary/5 border-primary text-on-surface' 
                      : 'bg-surface border-outline-variant hover:border-primary/40'
                  }`}
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-headline font-bold text-on-surface">{addr.name}</span>
                    <span className="font-mono text-outline">{addr.phone}</span>
                  </div>
                  <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed">
                    {addr.region} {addr.detail}
                  </p>
                  {addr.isDefault && (
                    <span className="inline-block bg-primary/10 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded mt-1.5">
                      默认地址
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setIsAddrModalOpen(false);
                onNavigate('PROFILE');
              }}
              className="w-full py-2.5 rounded-xl border border-dashed border-primary text-primary hover:bg-primary/5 font-headline text-[12px] font-bold text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_location</span>
              去“我的”页面管理或新增地址
            </button>
          </div>
        </div>
      )}

      <main className="px-5 max-w-lg mx-auto md:max-w-2xl flex flex-col gap-5 animate-fade-in">
        
        {/* Address Selector card */}
        <section 
          onClick={() => setIsAddrModalOpen(true)}
          className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm relative overflow-hidden cursor-pointer hover:border-primary/30 active:scale-[0.99] transition-all"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-blue-400 to-primary"></div>
          
          <div className="flex items-start gap-3 mt-1">
            <span className="material-symbols-outlined text-primary mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
            <div className="flex-grow">
              {activeAddress ? (
                <>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-headline font-bold text-[15px] text-on-surface flex items-center gap-1.5">
                      {activeAddress.name}
                      {activeAddress.isDefault && (
                        <span className="bg-primary/10 text-primary text-[9px] font-sans px-1.5 py-0.5 rounded font-bold">
                          默认
                        </span>
                      )}
                    </h3>
                    <span className="font-mono text-[13px] text-outline">
                      {activeAddress.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}
                    </span>
                  </div>
                  <p className="font-sans text-[12.5px] text-on-surface-variant leading-relaxed">
                    {activeAddress.region} {activeAddress.detail}
                  </p>
                </>
              ) : (
                <p className="font-sans text-[13px] text-outline">请选择或添加收货地址</p>
              )}
            </div>
            <span className="material-symbols-outlined text-outline text-[18px] self-center ml-2">chevron_right</span>
          </div>
        </section>

        {/* Ordered Product List */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm">
          <h3 className="font-headline text-[14px] font-bold text-on-surface mb-4 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-[18px]">shopping_bag</span>
            方剂包明细
          </h3>

          {cart.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <span className="material-symbols-outlined text-outline text-[32px]">production_quantity_limits</span>
              <p className="font-headline text-[13px] text-on-surface-variant font-medium">您的方剂包空空如也</p>
              <button 
                onClick={() => onNavigate('SHOP')}
                className="text-[12px] text-primary hover:underline font-bold cursor-pointer"
              >
                立即去选购中药材
              </button>
            </div>
          ) : (
            <div className="divide-y divide-surface-container">
              {cart.map((item) => (
                <div key={item.product.id} className="py-3 flex gap-4 first:pt-0 last:pb-0 justify-between items-center">
                  <img 
                    referrerPolicy="no-referrer"
                    src={item.product.image} 
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <h4 className="font-headline text-[13.5px] font-bold text-on-surface mb-0.5">{item.product.name}</h4>
                    <span className="text-[10px] bg-secondary-container/40 text-primary px-1.5 py-0.2 rounded font-sans">
                      {item.product.origin}
                    </span>
                    <div className="font-sans text-[13px] text-primary font-bold mt-1">¥{item.product.price}</div>
                  </div>

                  {/* Quantity adjusts */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-surface border border-outline-variant text-on-surface flex items-center justify-center cursor-pointer hover:bg-surface-container-low"
                    >
                      -
                    </button>
                    <span className="font-sans text-[12px] font-semibold text-on-surface w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-surface border border-outline-variant text-on-surface flex items-center justify-center cursor-pointer hover:bg-surface-container-low"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Shipping & Notes */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-headline text-[13.5px] font-bold text-on-surface">配送服务</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShipping('EXPRESS')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-headline font-bold border transition-all cursor-pointer ${
                  shipping === 'EXPRESS'
                    ? 'border-primary bg-primary-fixed/50 text-primary'
                    : 'border-outline-variant bg-transparent text-on-surface-variant'
                }`}
              >
                顺丰专送 (免邮)
              </button>
              <button
                type="button"
                onClick={() => setShipping('SELF_PICKUP')}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-headline font-bold border transition-all cursor-pointer ${
                  shipping === 'SELF_PICKUP'
                    ? 'border-primary bg-primary-fixed/50 text-primary'
                    : 'border-outline-variant bg-transparent text-on-surface-variant'
                }`}
              >
                药房自提
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-headline text-[13.5px] font-bold text-on-surface block" htmlFor="note">订单备注 (煎煮说明 / 忌服)</label>
            <input 
              id="note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="可备注中药代熬或中药切配工艺说明..."
              className="w-full bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-[13px] outline-none transition-colors"
            />
          </div>
        </section>

        {/* Payment Methods */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm">
          <h3 className="font-headline text-[14px] font-bold text-on-surface mb-3.5">支付方式</h3>

          <div className="flex flex-col gap-2.5">
            {[
              { id: 'WECHAT', name: '微信支付', label: 'WeChat Pay', icon: 'account_balance_wallet', color: 'text-green-600' },
              { id: 'ALIPAY', name: '支付宝', label: 'Alipay', icon: 'credit_card', color: 'text-blue-600' },
              { id: 'INSURANCE', name: '个人医保卡余额', label: 'Personal Medical Insurance Card', icon: 'shield_heart', color: 'text-primary' },
            ].map((p) => (
              <label key={p.id} className="cursor-pointer">
                <input 
                  type="radio" 
                  name="payment" 
                  checked={payment === p.id}
                  onChange={() => setPayment(p.id as any)}
                  className="sr-only peer"
                />
                <div className="w-full p-3 rounded-xl border border-outline-variant bg-surface text-on-surface-variant transition-all hover:bg-surface-container-low peer-checked:bg-secondary-container/40 peer-checked:text-primary peer-checked:border-primary flex justify-between items-center group shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined text-[20px] ${p.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-sans text-[13.5px] font-bold text-on-surface">{p.name}</span>
                      <span className="font-sans text-[10px] text-outline">{p.label}</span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined hidden peer-checked:block text-primary">check_circle</span>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Values settlement sum */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 border border-surface-container-low shadow-sm space-y-2.5 text-[13px]">
          <div className="flex justify-between text-on-surface-variant">
            <span>方剂金额总计:</span>
            <span>¥{subtotal}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>首单或满额健康抵扣:</span>
            <span className="text-emerald-700">-¥{discount}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>顺丰同城温湿度配送费:</span>
            <span className="text-primary font-semibold">¥0 (免邮)</span>
          </div>
          <div className="flex justify-between text-[15px] font-bold text-on-surface border-t border-surface-container-high pt-2.5 mt-1">
            <span className="font-headline font-bold text-primary">应付总额:</span>
            <span className="font-sans font-extrabold text-primary text-[18px]">¥{total}</span>
          </div>
        </section>
      </main>

      {/* Sticky footer settle bar */}
      <div className="fixed bottom-0 left-0 w-full glass-panel px-5 py-3 pb-safe z-45">
        <div className="max-w-lg mx-auto md:max-w-2xl flex items-center justify-between gap-4">
          <div className="flex flex-col py-1">
            <span className="text-[11px] text-outline font-medium">实付款 (Total Paid)</span>
            <div className="flex items-baseline text-primary gap-0.5">
              <span className="text-[12px] font-bold">¥</span>
              <span className="text-[20px] font-extrabold">{total}</span>
            </div>
          </div>
          
          <button 
            id="btn-submit-order"
            onClick={handleSubmitOrder}
            disabled={cart.length === 0}
            className="flex-grow py-3 px-6 rounded-xl bg-primary text-on-primary font-headline text-[13.5px] font-bold flex justify-center items-center gap-1.5 shadow-md hover:bg-primary-container hover:text-on-primary-container transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-99"
          >
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
            提交模拟订单 (Chain Seal)
          </button>
        </div>
      </div>
    </div>
  );
};
