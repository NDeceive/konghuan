/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HerbProduct, DietRecipe, UserProfile, HealthArchive } from '../types';

export const INITIAL_USER: UserProfile = {
  name: '李心悦',
  phone: '13812345678',
  role: 'CONSUMER',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkSYQxbA0fNG7pDC4_syJIBYrGlhPFuw93FVl9o6DKyJdEOu0o0pVWJx0TfnSaNeVVS4wZgIpqsaSjcJRmldE8J-tinbZQ0t8eZFDnezmUozQDXP-0yHtKIUL-0fuIC-IPmCN5j3F2BllzkQSnV6fJ-KITl1hFLlK3NJytTFkM6RpTo8Mg2LOQmegwissvoU1tDVtWvFB8OWc6SysTdTMBvZpqTaOg4PsMHGSDyhNGiKqOk2O_br5H0g',
  memberStatus: '普通会员 (Ordinary Member)',
  favoritesCount: 12,
  couponsCount: 3,
  footprintsCount: 48,
};

export const INITIAL_HEALTH_ARCHIVE: HealthArchive = {
  bodyType: '气虚夹湿',
  score: 78,
  answers: {
    q1: '经常这样，特别明显',
    westernMeds: ['阿司匹林'],
  },
  vitals: {
    heartRate: 72,
    bloodOxygen: 98,
    temperature: 36.5,
  },
  updatedAt: '2026-07-07 20:30:00',
};

export const PRODUCTS: HerbProduct[] = [
  {
    id: 'huangqi',
    name: '特级安国黄芪片',
    latinName: 'Astragalus membranaceus',
    price: 128,
    originalPrice: 168,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrCoAcBOTMWccJf2KVXfvIREjv3eVX-INU_UlPUb9Hh_rwZ6NQ9izQBoqJyW6n2j4-DKJb-XRGXrjL-3ouTFXTSFXkKg7j-BawW9gUEG10Uem2GIYpKFpBMzpG1zOiNRHgJjrdlGwtVf5ffC08_p9F3YJQ7UF1S2jA-8ukEa2Q4QfQNgLj0t4q9-GxRVTTxiO2CKgrPOMCtdfmnMQrL3yWCM8YQwyvmTmUGg8eVOhr-L63VqPFoK0DHg',
    origin: '河北·安国',
    description: '无硫熏制，菊花心明显。补气升阳，益卫固表，精选六年根。',
    tags: ['无硫熏', '精选六年根', '补气升阳'],
    rating: 4.9,
    digitalPassport: {
      id: 'TCM-2026-0707-1280',
      batchNo: 'BN-AG-2607A',
      blockHash: '0x3f6653ea90bc74d1e5f6a90bc7d1e5f6a90ab01',
      timestamp: '2026-07-01 08:30:00 UTC',
      timeline: [
        { id: 1, title: '农户采收登记', description: '河北省保定市安国市种植基地采挖', time: '2026-06-15 07:00', icon: 'agriculture' },
        { id: 2, title: 'AI 智能入库扫描', description: '外观切片纹理及菊花心识别合格，等级判定为特级', time: '2026-06-20 11:30', icon: 'document_scanner' },
        { id: 3, title: '专家品质复核', description: '通过无硫熏检测，多糖含量高达2.4%', time: '2026-06-25 15:00', icon: 'psychology' },
        { id: 4, title: '数字护照生成', description: '溯源及检测报告上链，生成专属密码防伪防篡改', time: '2026-07-01 08:30', icon: 'verified' },
        { id: 5, title: '上架销售', description: '本草智联官方商城自营直供', time: '2026-07-05 10:00', icon: 'storefront' }
      ]
    }
  },
  {
    id: 'gouqi',
    name: '正宗中宁免洗红枸杞',
    latinName: 'Lycium barbarum L.',
    price: 89,
    originalPrice: 118,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1uvxKYvsuFcHacXLea9oT5dD0rHzdKzGS9f62ndgf7634MPlbmueZR9uEdTkWq7qxKcO0fh7RNVeF0uH8ORvXJOwa_DRCCCUGVzaDSf_QYwzRSBhXBnRXZSsZK_VulalVV04veIaREm4PO0IjerlWKevvOn9vrM7AGP7zdx_yn2aiNgwlgK3Micrix0dWrUlomYAJyZAikdBNBqY0GakBG559KvMPN2fJD3ADS5zF1cepIJMk6jgmKw',
    origin: '宁夏·中宁',
    description: '头茬采摘，果粒大且饱满。滋补肝肾，益精明目，可直接嚼食。',
    tags: ['头茬采摘', '高甜多汁', '益精明目'],
    rating: 4.8,
    digitalPassport: {
      id: 'TCM-2026-0707-8911',
      batchNo: 'BN-ZN-2607B',
      blockHash: '0x274e3dbeae7f311cce6d05f4025a5d0b95f4025',
      timestamp: '2026-07-02 10:15:30 UTC',
      timeline: [
        { id: 1, title: '农户采收登记', description: '宁夏中卫市中宁县头茬手工带柄采摘', time: '2026-06-18 06:00', icon: 'agriculture' },
        { id: 2, title: 'AI 智能入库扫描', description: '红外线无损检测，果实饱满度符合特优标准', time: '2026-06-22 13:45', icon: 'document_scanner' },
        { id: 3, title: '专家品质复核', description: '未检测出任何农药残留，免洗直接食用级别', time: '2026-06-27 10:00', icon: 'psychology' },
        { id: 4, title: '数字护照生成', description: '唯一溯源码生成并部署在智能合约中', time: '2026-07-02 10:15', icon: 'verified' },
        { id: 5, title: '上架销售', description: '本草智联精选道地商城', time: '2026-07-06 09:00', icon: 'storefront' }
      ]
    }
  },
  {
    id: 'shanyao',
    name: '温县铁棍山药片',
    latinName: 'Dioscorea opposita Thunb.',
    price: 65,
    originalPrice: 85,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoW_NfO5IFebhBd7n8RA5sscbkF9WdyAXbBaHUIsDajR7BvtsaE-PrppvcSv4rUJE40ApOPx7jtt4j-We8RwB6ZZon2qoFG9mlxk6hQHtHfTJ3OLm7uP1Pp0KuJ_aRkzzMi68iIC76VnfKsrZ0vf3mf7ZTtF7lKQyHTDU7zaLRMAsCD8KqA6W9vY2EkH-c_FXUF0MeXGK1KwZtXii9EWg7UI6YHdfBRvwyqoCTy2Ed7Z4sT_DCbpPBRg',
    origin: '河南·焦作',
    description: '垆土地种植，粉性足粘液多。健脾厚肠，补肺益肾，无硫无漂白。',
    tags: ['垆土地', '健脾胃', '无硫熏无漂白'],
    rating: 5.0,
    digitalPassport: {
      id: 'TCM-2026-0707-6502',
      batchNo: 'BN-WX-2607C',
      blockHash: '0x5f4025ffdcc1cee9d3cee9d3ffdcc1ffdcc1f',
      timestamp: '2026-07-03 14:45:10 UTC',
      timeline: [
        { id: 1, title: '农户采收登记', description: '河南省焦作市温县垆土地生态园手工采挖', time: '2026-06-20 08:30', icon: 'agriculture' },
        { id: 2, title: 'AI 智能入库扫描', description: '质地截面淀粉度检测合格，粘液腺完整率98%', time: '2026-06-24 16:00', icon: 'document_scanner' },
        { id: 3, title: '专家品质复核', description: '无漂白剂残留判定合格，高品质原切片', time: '2026-06-29 11:15', icon: 'psychology' },
        { id: 4, title: '数字护照生成', description: '上链打包生成区块哈希，防伪数智凭证确权', time: '2026-07-03 14:45', icon: 'verified' },
        { id: 5, title: '上架销售', description: '本草自营药房及代茶饮专区', time: '2026-07-06 14:00', icon: 'storefront' }
      ]
    }
  },
  {
    id: 'yanshen',
    name: '长白山野山参 (特级)',
    latinName: 'Panax ginseng C. A. Mey.',
    price: 2899,
    originalPrice: 3500,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIdXQ4BLC4W6H4l4e-EL9_y7-bRTRyLCAUtHOQNd8OvuOchCE3kL9Htw6SblZB83s5HRPXkWmgFAVlKe8Os76YDN26bgS-rYVg9LVFvfB9-nCNRjbPEGpFcjgYfGuSEuXbY7KPEAT-WKNV5zuTWLWSDKb-yym8yC7Q6noeJUM5A3zYAZDmAFK8mFPlxmHeqzHeQRIt-S_k-f7vsqOtOWoq1OraeffnzH-mFkXraId3qB3fpluWRfhzSQ',
    origin: '吉林·长白',
    description: '深山林下放山，年份15年以上，大补元气，生津安神，复脉固脱。',
    tags: ['长白山野参', '大补元气', '15年野生'],
    rating: 5.0,
    digitalPassport: {
      id: 'TCM-2023-8890-4421',
      batchNo: 'BN-CBS-2310A',
      blockHash: '0x8f7a9c2b4d1e5f6a90bc7d1e5f6a90bc74d1e5f6',
      timestamp: '2023-10-15 08:30:45 UTC',
      timeline: [
        { id: 1, title: '农户采收登记', description: '吉林省白山市抚松县万良镇放山人采挖', time: '2023-09-20 09:15', icon: 'agriculture' },
        { id: 2, title: 'AI 智能入库扫描', description: '外观特征（芦、艼、体、纹、须）符合野山参，无拼接损坏', time: '2023-09-25 14:20', icon: 'document_scanner' },
        { id: 3, title: '专家品质复核', description: '国家药典委员会专家团队抽检认证，皂苷含量极高', time: '2023-10-05 10:00', icon: 'psychology' },
        { id: 4, title: '数字护照生成', description: '溯源及国检信息上链，生成唯一哈希标识，不可篡改', time: '2023-10-15 08:30', icon: 'verified' },
        { id: 5, title: '上架销售', description: '本草智联官方商城官方特供，区块链实体确权', time: '2023-10-18 10:00', icon: 'storefront' }
      ]
    }
  }
];

export const RECIPES: DietRecipe[] = [
  {
    id: 'porridge',
    name: '黄芪山药养生粥',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC8XShmQXVEEJvH66s-8sIQa8AQgzJrPqP6x2Pq8tQaPFUBG8AYu0SI1R-EVUGH04oXKhGTw30HfczEIUtnEwUcPkjaQdP7yFYmjP0W3Cadpwm00f_5rifnFt3VCvdk6qwg8e8PSmxcSFrHm5FDSxf3C8mMKWHSO3VqvGcWbWY3Kq6q9oxcZiLeUczIIh2XAncy8IDTHBdHdVlxzLf3alLUt9R3L57ssDImZvC09-G9YWktL1M_dL8CCA',
    benefits: ['健脾益气', '温和调理'],
    description: '此膳食源自中医经典食疗方，以黄芪固表补气，山药健脾益胃。性质温和，适合日常养生调理，能有效改善疲劳乏力、食欲不振等亚健康状态。',
    ingredients: [
      { name: '黄芪', quantity: '15g', benefit: '补气升阳', type: 'herb' },
      { name: '干山药', quantity: '30g', benefit: '平补脾胃', type: 'herb' },
      { name: '优质粳米', quantity: '50g', type: 'base' },
      { name: '宁夏枸杞', quantity: '5g', type: 'base' }
    ],
    steps: [
      '将黄芪洗净，用冷水浸泡20分钟，让有效成分更容易释出。干山药冲洗表面浮尘。',
      '将泡好的黄芪连水倒入砂锅中，大火烧开后转小火熬煮30分钟，滤出药汁备用。黄芪渣可丢弃。',
      '将粳米洗净，与山药一同放入黄芪药汁中，加入适量清水，大火煮沸后转小火慢熬约40分钟至粥稠。',
      '关火前5分钟加入洗净的枸杞，稍作焖煮，可依个人口味加入少许食盐调味即可。'
    ],
    suitable: [
      '脾胃虚弱、消化不良者',
      '气短乏力、容易疲劳的亚健康人群',
      '病后或产后体虚需要温和滋补者'
    ],
    unsuitable: [
      '感冒发热初期、体内有实邪者',
      '阴虚火旺、口干舌燥、大便秘结者',
      '食滞内停、脘腹胀满者慎用'
    ],
    linkedProductId: 'huangqi'
  },
  {
    id: 'soup',
    name: '百合莲子排骨汤',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDLXqa3X18eqUExw3uFEnIdg0vt8_b7Rl7oljmQ_ERDwpvI80Ja_RVbFbdoYBmhTrFxsxlP5LfrxP10yUnMo3UIg-V1t019fO6zSu7RMtU_bvcadHZcFuMpUKEI0CHeR8ctcQ8h8hpSNdn7CgfU9R_JKiR8fE402b43s3UkvPKcGoJb6Z-uuGg7eZtPomwVXPz1ICwjJXADITlpw206I4rTZ7vyHZLuNhfPYQwh8gXuYOo5wwtH4ZpLw',
    benefits: ['润燥养阴', '清心安神'],
    description: '秋燥伤肺，此汤能清心安神、润肺止咳。结合您的平和/湿热体质，非常适合作为本周的食补调理。',
    ingredients: [
      { name: '鲜百合', quantity: '30g', benefit: '润肺止咳', type: 'herb' },
      { name: '湘莲子', quantity: '20g', benefit: '养心安神', type: 'herb' },
      { name: '排骨', quantity: '300g', type: 'base' },
      { name: '生姜', quantity: '3片', type: 'base' }
    ],
    steps: [
      '排骨洗净斩块，冷水下锅焯水，捞出冲洗干净。',
      '鲜百合瓣瓣剥开洗净；莲子去心，温水浸泡15分钟。',
      '砂锅中注入清水，放入排骨、生姜、莲子，大火烧开，转小火慢炖1.5小时。',
      '加入鲜百合，继续炖煮15分钟，出锅前加入适量食盐调味即成。'
    ],
    suitable: [
      '肺燥咳嗽、咽干口渴者',
      '失眠多梦、虚烦不安、心神不宁者',
      '秋季防燥润补的日常保养'
    ],
    unsuitable: [
      '风寒咳嗽、大便泄泻者忌用',
      '脾胃虚寒、腹泻便溏者不宜多食'
    ]
  }
];
