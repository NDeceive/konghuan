/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, HealthArchive } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isMock?: boolean;
}

interface AIAdvisorScreenProps {
  userProfile: UserProfile;
  healthArchive: HealthArchive;
}

export const AIAdvisorScreen: React.FC<AIAdvisorScreenProps> = ({ userProfile, healthArchive }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialGreeting = `您好，${userProfile.name}！我是您的专属“本草AI助手”。

看到您当前的体质评估为「${healthArchive.bodyType}」倾向，平时有怕冷、易劳累的表现。此外，您的档案中记录了正在服用的西药「${(healthArchive.answers.westernMeds || []).join(", ") || "无"}」。

在中医药膳配伍中，服药避忌非常关键。例如「阿司匹林」与「华法林」均属于强效抗凝药，若在此时自行搭配「丹参」或「人参」，会严重增加内出血和消化道粘膜受损的风险！

今天想咨询我关于「${healthArchive.bodyType}」体质的中医调理药膳、配伍禁忌，或是如何安全服用西药中药吗？`;

  useEffect(() => {
    // Load initial greeting
    setMessages([
      {
        id: 'initial',
        role: 'assistant',
        content: initialGreeting,
      }
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsgId = Date.now().toString();
    const newMessages: Message[] = [
      ...messages,
      { id: userMsgId, role: 'user', content: textToSend }
    ];

    setMessages(newMessages);
    setInputMsg('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/tcm-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          userProfile: userProfile,
          healthArchive: healthArchive
        })
      });

      if (!response.ok) {
        throw new Error('网络请求异常，请稍后再试');
      }

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.text,
          isMock: data.isMock
        }
      ]);
    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `【网络微恙】本草AI目前有点忙，或大模型接口暂不可用。针对您的提问：\"${textToSend}\"，建议您平时服用黄芪、山药来温补脾气，在服用西药期间严格忌服活血化瘀的大辛大热之物。请稍后重试连接。`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const presetQuestions = [
    { label: '我的体质适合喝参茸汤吗？', q: '请问我当前的体质，适合喝人参鹿茸汤，或者吃野山参进补吗？' },
    { label: '阿司匹林能和枸杞一起吃吗？', q: '我正在服用的阿司匹林，可以跟红枸杞、黄芪一起泡茶喝吗？存在任何药食交互风险吗？' },
    { label: '有什么食疗能改善怕冷和重感？', q: '我总是手脚发凉、全身沉重无力，中医有哪些简单易行的食疗粥或者代茶饮推荐？' },
  ];

  return (
    <div id="ai-advisor-section" className="max-w-lg mx-auto md:max-w-2xl px-5 flex flex-col h-[calc(100vh-14rem)] bg-surface-container-lowest rounded-2xl overflow-hidden ambient-shadow border border-surface-container-low">
      {/* Advisor Header */}
      <div className="px-4 py-3 bg-primary-container text-on-primary-container border-b border-surface-container flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-primary shadow-sm">
          <span className="material-symbols-outlined text-[20px]">psychology</span>
        </div>
        <div>
          <h4 className="font-headline text-[14px] font-bold">本草 AI 在线咨询助手</h4>
          <span className="text-[10px] opacity-80 font-sans">精通传统伤寒金匮医理与现代临床交互分析</span>
        </div>
      </div>

      {/* Messages Scroll Log */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg) => {
          const isAI = msg.role === 'assistant';
          return (
            <div 
              key={msg.id} 
              className={`flex items-start gap-2.5 max-w-[88%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {isAI ? (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary shadow-sm flex-shrink-0">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                </div>
              ) : (
                <img 
                  referrerPolicy="no-referrer"
                  src={userProfile.avatar} 
                  alt={userProfile.name} 
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-outline/20"
                />
              )}

              <div className={`p-3 rounded-2xl font-sans text-[13px] leading-relaxed shadow-sm relative ${
                isAI 
                  ? 'bg-surface-container-low text-on-surface rounded-tl-none border border-outline-variant/50' 
                  : 'bg-primary text-on-primary rounded-tr-none'
              }`}>
                {msg.isMock && (
                  <span className="absolute -top-4 right-1 text-[9px] bg-tertiary-container/30 text-tertiary px-1.5 py-0.2 rounded font-sans scale-90">
                    智能模拟
                  </span>
                )}
                {/* Formatting paragraphs and lists nicely */}
                <div className="whitespace-pre-wrap break-words">
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}

        {/* Pulsing AI thinking spinner */}
        {isLoading && (
          <div className="flex items-start gap-2.5 mr-auto max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-on-secondary animate-pulse shadow-sm">
              <span className="material-symbols-outlined text-[16px]">psychology</span>
            </div>
            <div className="p-3 bg-surface-container-low text-on-surface-variant rounded-2xl rounded-tl-none border border-outline-variant/30 flex items-center gap-1.5 shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-200"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-300"></span>
              </div>
              <span className="font-sans text-[11.5px] italic">本草AI正在遣方研药，请稍候...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Questions Slider */}
      <div className="px-4 py-2 border-t border-surface-container-low bg-surface/50 overflow-x-auto no-scrollbar flex gap-2 flex-shrink-0">
        {presetQuestions.map((pq, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => sendMessage(pq.q)}
            disabled={isLoading}
            className="flex-shrink-0 px-3 py-1.5 bg-surface border border-outline-variant rounded-full font-headline text-[11px] font-medium text-on-surface hover:border-primary transition-all cursor-pointer whitespace-nowrap shadow-sm disabled:opacity-50"
          >
            {pq.label}
          </button>
        ))}
      </div>

      {/* Message Inputs Footer */}
      <div className="p-3 border-t border-surface-container flex-shrink-0 bg-surface/80 backdrop-blur-md">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputMsg);
          }}
          className="flex gap-2"
        >
          <input 
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            disabled={isLoading}
            placeholder="向本草AI提问，如：胃痛如何服药调养..."
            className="flex-grow bg-surface border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-colors disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!inputMsg.trim() || isLoading}
            className="bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container px-4 py-2.5 rounded-xl font-headline text-[13px] font-bold flex items-center justify-center cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="发送消息"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
