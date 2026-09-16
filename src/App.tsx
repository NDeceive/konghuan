/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ScreenType, UserProfile, HealthArchive, HerbProduct, DietRecipe, OrderItem, UserRole } from './types';
import { INITIAL_USER, INITIAL_HEALTH_ARCHIVE, PRODUCTS, RECIPES } from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { StepperScreen } from './components/StepperScreen';
import { AssessmentResultsScreen } from './components/AssessmentResultsScreen';
import { AIAdvisorScreen } from './components/AIAdvisorScreen';
import { RiskAnalysisScreen } from './components/RiskAnalysisScreen';
import { DietDetailScreen } from './components/DietDetailScreen';
import { ShopScreen } from './components/ShopScreen';
import { ProductDetailScreen } from './components/ProductDetailScreen';
import { OrderConfirmationScreen } from './components/OrderConfirmationScreen';
import { ProfileScreen } from './components/ProfileScreen';

export default function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // Start with Login
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('LOGIN');
  const [stepperStep, setStepperStep] = useState<number>(1);
  const [healthArchive, setHealthArchive] = useState<HealthArchive>(INITIAL_HEALTH_ARCHIVE);
  const [selectedRecipe, setSelectedRecipe] = useState<DietRecipe>(RECIPES[0]);
  const [selectedProduct, setSelectedProduct] = useState<HerbProduct>(PRODUCTS[0]);
  const [cart, setCart] = useState<OrderItem[]>([]);

  // Navigation controller
  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
    // Auto-scroll to top when screen shifts
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    handleNavigate('HOME');
  };

  const handleLogout = () => {
    setUserProfile(null);
    setCart([]);
    setHealthArchive(INITIAL_HEALTH_ARCHIVE);
    handleNavigate('LOGIN');
  };

  const handleUpdateArchive = (updated: Partial<HealthArchive>) => {
    setHealthArchive(prev => ({
      ...prev,
      ...updated,
      answers: {
        ...prev.answers,
        ...(updated.answers || {}),
      },
      vitals: {
        ...prev.vitals,
        ...(updated.vitals || {}),
      },
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }));
  };

  // Add to cart helper
  const handleAddToCart = (product: HerbProduct) => {
    setCart(prev => {
      const idx = prev.findIndex(item => item.product.id === product.id);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += 1;
        return copy;
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  // Buy immediately helper (clears other items and places only this one)
  const handleBuyImmediately = (product: HerbProduct) => {
    setCart([{ product, quantity: 1 }]);
  };

  const handleUpdateQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev => prev.map(item => {
        if (item.product.id === productId) {
          return { ...item, quantity: qty };
        }
        return item;
      }));
    }
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleIncrementFootprints = () => {
    if (userProfile) {
      setUserProfile(prev => prev ? {
        ...prev,
        footprintsCount: prev.footprintsCount + 1,
        couponsCount: Math.max(0, prev.couponsCount - 1)
      } : null);
    }
  };

  const handleUpdateRole = (role: UserRole) => {
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        role: role,
      });
    }
  };

  // Trigger Gemini health assessment API call
  const handleAssessWithGemini = async () => {
    try {
      const response = await fetch('/api/health-assess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: healthArchive.answers,
          vitals: healthArchive.vitals,
        }),
      });

      if (!response.ok) {
        throw new Error('体质大模型诊断故障');
      }

      const data = await response.json();
      
      setHealthArchive(prev => ({
        ...prev,
        score: data.score,
        bodyType: data.bodyType,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }));
    } catch (err) {
      console.error("Gemini assess failed, falling back to local formulas:", err);
      // Fallback local calculations
      const coldLevel = healthArchive.answers.q1;
      let scoreVal = 78;
      let bodyTypeVal = '气虚夹湿';
      if (coldLevel.includes('偶尔')) {
        scoreVal = 85;
        bodyTypeVal = '平和夹湿';
      } else if (coldLevel.includes('基本不觉得冷')) {
        scoreVal = 92;
        bodyTypeVal = '阴虚内热';
      }

      setHealthArchive(prev => ({
        ...prev,
        score: scoreVal,
        bodyType: bodyTypeVal,
        updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      }));
    }
  };

  // Quick select helper recipes/products
  const handleSelectRecipeById = (id: string) => {
    const found = RECIPES.find(r => r.id === id);
    if (found) setSelectedRecipe(found);
  };

  const handleSelectProductById = (id: string) => {
    const found = PRODUCTS.find(p => p.id === id);
    if (found) setSelectedProduct(found);
  };

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="bg-background text-on-background min-h-screen relative font-body select-none">
      {/* Dynamic Header */}
      <Header 
        currentScreen={currentScreen} 
        onNavigate={handleNavigate} 
        userProfile={userProfile || undefined} 
      />

      {/* Screen Render Engine */}
      <div className="w-full">
        {currentScreen === 'LOGIN' && (
          <LoginScreen onLoginSuccess={handleLoginSuccess} />
        )}

        {currentScreen === 'HOME' && userProfile && (
          <HomeScreen 
            userProfile={userProfile}
            healthArchive={healthArchive}
            onNavigate={handleNavigate}
            onSetStepperStep={setStepperStep}
            onSelectRecipeById={handleSelectRecipeById}
            onSelectProductById={handleSelectProductById}
          />
        )}

        {currentScreen === 'STEPPER' && (
          <StepperScreen 
            healthArchive={healthArchive}
            onUpdateArchive={handleUpdateArchive}
            onNavigate={handleNavigate}
            currentStep={stepperStep}
            onSetStep={setStepperStep}
            onAssessWithGemini={handleAssessWithGemini}
          />
        )}

        {currentScreen === 'ASSESSMENT_RESULTS' && userProfile && (
          <AssessmentResultsScreen 
            userProfile={userProfile}
            healthArchive={healthArchive}
            onNavigate={handleNavigate}
            onSelectRecipeById={handleSelectRecipeById}
            onSelectProductById={handleSelectProductById}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentScreen === 'AI_ADVISOR' && userProfile && (
          <AIAdvisorScreen 
            userProfile={userProfile}
            healthArchive={healthArchive}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'RISK_DETAILS' && (
          <RiskAnalysisScreen onNavigate={handleNavigate} />
        )}

        {currentScreen === 'DIET_DETAIL' && (
          <DietDetailScreen 
            recipe={selectedRecipe}
            onNavigate={handleNavigate}
            onSelectProductById={handleSelectProductById}
          />
        )}

        {currentScreen === 'SHOP' && (
          <ShopScreen 
            onNavigate={handleNavigate}
            onSelectProductById={handleSelectProductById}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentScreen === 'PRODUCT_DETAIL' && (
          <ProductDetailScreen 
            product={selectedProduct}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
            onBuyImmediately={handleBuyImmediately}
          />
        )}

        {currentScreen === 'CONFIRM_ORDER' && (
          <OrderConfirmationScreen 
            cart={cart}
            onNavigate={handleNavigate}
            onClearCart={handleClearCart}
            onIncrementFootprints={handleIncrementFootprints}
            onUpdateQuantity={handleUpdateQuantity}
          />
        )}

        {currentScreen === 'PROFILE' && userProfile && (
          <ProfileScreen 
            userProfile={userProfile}
            healthArchive={healthArchive}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            onSetStepperStep={setStepperStep}
            onUpdateRole={handleUpdateRole}
          />
        )}
      </div>

      {/* Dynamic Bottom Tabbed Navigation */}
      <BottomNav 
        currentScreen={currentScreen} 
        onNavigate={handleNavigate} 
        cartCount={cartTotalCount}
      />
    </div>
  );
}
