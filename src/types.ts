/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ScreenType = 
  | 'LOGIN'
  | 'HOME'
  | 'STEPPER'
  | 'ASSESSMENT_RESULTS'
  | 'AI_ADVISOR'
  | 'RISK_DETAILS'
  | 'DIET_DETAIL'
  | 'SHOP'
  | 'PRODUCT_DETAIL'
  | 'CONFIRM_ORDER'
  | 'PROFILE';

export type UserRole = 'CONSUMER' | 'PARTNER' | 'ADMIN';

export interface UserProfile {
  name: string;
  phone: string;
  role: UserRole;
  avatar: string;
  memberStatus: string;
  favoritesCount: number;
  couponsCount: number;
  footprintsCount: number;
}

export interface SmartVitals {
  heartRate: number;
  bloodOxygen: number;
  temperature: number;
}

export interface HealthArchive {
  bodyType: string; // e.g. "气虚夹湿"
  score: number;
  answers: {
    q1: string; // "经常这样，特别明显" | "偶尔会，不算严重" | "基本不觉得冷，甚至怕热"
    tonguePhoto?: string;
    tongueAnalysis?: string;
    caseOcr?: string;
    westernMeds: string[];
  };
  vitals: SmartVitals;
  updatedAt: string;
}

export interface HerbProduct {
  id: string;
  name: string;
  latinName?: string;
  price: number;
  originalPrice?: number;
  image: string;
  origin: string;
  description: string;
  tags: string[];
  rating: number;
  digitalPassport?: DigitalPassport;
}

export interface DigitalPassport {
  id: string; // TCM-2023-8890-4421
  batchNo: string; // BN-CBS-2310A
  blockHash: string; // 0x8f7a9c2b...
  timestamp: string; // 2023-10-15 08:30:45 UTC
  timeline: TraceabilityStep[];
}

export interface TraceabilityStep {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: string; // material icon name
}

export interface DietRecipe {
  id: string;
  name: string;
  image: string;
  benefits: string[];
  description: string;
  ingredients: { name: string; quantity: string; benefit?: string; type?: 'herb' | 'base' }[];
  steps: string[];
  suitable: string[];
  unsuitable: string[];
  linkedProductId?: string;
}

export interface OrderItem {
  product: HerbProduct;
  quantity: number;
}
