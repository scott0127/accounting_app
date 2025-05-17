import { useTransactionStore } from '~/stores/transaction'
import { ref } from 'vue'

export interface ClassifierResult {
  categoryId: string;
  confidence: number;
  explanation: string;
  possibleCategories?: Array<{id: string, name: string, score: number}>;
}

/**
 * A composable function that provides LLM-like expense classification
 * using advanced pattern matching and context understanding.
 */
export function useExpenseClassifier() {
  const store = useTransactionStore()
  
  // Store user corrections for learning
  const userCorrections = ref<Record<string, string>>({})
  
  // Try to load user corrections from localStorage
  try {
    const savedCorrections = localStorage.getItem('expenseClassifierCorrections')
    if (savedCorrections) {
      userCorrections.value = JSON.parse(savedCorrections)
    }
  } catch (e) {
    console.error('Failed to load classifier corrections:', e)
  }
  
  /**
   * Enhanced category-specific keywords with context for expense classification
   */
  const categoryKeywords = {
    food: {
      keywords: [
        '餐', '飯', '食', '吃', '菜', '廚', '烹', '煮', '火鍋', '麵', '米', '肉', '魚', 
        '蔬菜', '水果', '零食', '飲料', '奶茶', '咖啡', '茶', '早餐', '午餐', '晚餐', 
        'restaurant', 'lunch', 'dinner', 'breakfast', 'food', 'eat', 'meal', 'snack'
      ],
      brands: [
        '麥當勞', '肯德基', '星巴克', '必勝客', '摩斯', '全家', '7-11', '全聯', '頂好',
        'McDonald', 'KFC', 'Starbucks', 'Pizza Hut', 'MOS Burger', 'FamilyMart'
      ],
      context: ['吃飯', '點餐', '下館子', '外送', '外賣']
    },
    transport: {
      keywords: [
        '車', '機', '船', '票', '程', '行', '搭', '騎', '駕', '運', '交通', '計程車', '公車', 
        '捷運', '高鐵', '火車', '開車', '停車', '加油', '維修',
        'bus', 'train', 'taxi', 'uber', 'car', 'gas', 'transport', 'commute', 'travel'
      ],
      brands: [
        'Uber', 'Lyft', '台鐵', '高鐵', '捷運', '公車', '中油', '台塑石油', '機場快線'
      ],
      context: ['搭車', '乘車', '通勤', '路程']
    },
    shopping: {
      keywords: [
        '買', '購', '物', '衣', '鞋', '包', '錶', '飾', '戴', '用品', '傢俱', '家電', '電器', 
        '家居', '購物', '網購', '商場', '商店', '超市', '賣場', '盲盒', '手辦', '模型', '收藏',
        'shop', 'purchase', 'mall', 'market', 'store', 'buy', 'toy', 'figure', 'collectible'
      ],
      brands: [
        '誠品', '小米', '蘋果', '三星', '華為', '家樂福', '大潤發', '宜家', 'IKEA', 'Apple', 'Samsung',
        '吉伊卡哇', '美琪', '玩具'
      ],
      context: ['買東西', '添置', '收藏品']
    },
    entertainment: {
      keywords: [
        '玩', '樂', '看', '聽', '賞', '遊', '戲', '劇', '影', '視', '唱', '歌', '酒', '啤', '電影', 
        '劇院', '音樂', '遊戲', '遊樂', '旅遊', '度假', '遊玩',
        'game', 'movie', 'show', 'play', 'entertainment', 'music', 'concert', 'travel'
      ],
      brands: [
        'Netflix', 'Steam', 'Nintendo', 'Switch', 'PlayStation', 'Xbox', '威秀', '國賓',
        '大潤發', 'Disney+'
      ],
      context: ['娛樂', '消遣', '休閒', '放鬆']
    },
    health: {
      keywords: [
        '醫', '藥', '診', '病', '療', '治', '檢', '康', '保', '身', '體', '養', '生', '健', 
        '瑜珈', '運動', '健身', '醫院', '診所', '保險',
        'doctor', 'medicine', 'health', 'fitness', 'gym', 'medical', 'insurance'
      ],
      brands: [
        '長庚', '榮總', '台大醫院', '馬偕', '健保', '國泰人壽', '南山人壽'
      ],
      context: ['看病', '治療', '檢查']
    },
    housing: {
      keywords: [
        '租', '屋', '宅', '住', '房', '廈', '堂', '宿', '廳', '臥', '寓', '寢', '家', 
        '房租', '水電', '瓦斯', '網路', '電話', '電視', '水費', '電費', '管理費',
        'home', 'rent', 'house', 'apartment', 'utility', 'water', 'electricity'
      ],
      brands: [
        '台電', '自來水', '中華電信', '台灣大哥大', '遠傳', '台灣之星'
      ],
      context: ['住宿', '居住', '家用']
    },
    education: {
      keywords: [
        '學', '教', '育', '書', '讀', '課', '文', '筆', '紙', '研', '究', '訓', '練',
        '學校', '大學', '培訓', '補習', '家教', '論文',
        'school', 'university', 'education', 'book', 'study', 'course', 'class'
      ],
      brands: [
        '台大', '政大', '師大', '成大', '清大', '交大', '天下文化', '博客來'
      ],
      context: ['學習', '進修', '上課', '研讀']
    }
  }
  
  /**
   * Enhanced semantic understanding by extracting context from a description
   * @param description - The text to analyze
   * @returns An object with extracted context information
   */
  const extractContext = (description: string) => {
    const lowerDesc = description.toLowerCase()
    const words = lowerDesc.split(/\s+|[,，.。!！?？、]/g).filter(w => w.length > 0)
    
    // Find time context (morning, afternoon, evening)
    const timeContext = 
      /早上|早晨|上午|morning|breakfast/i.test(description) ? 'morning' :
      /中午|午餐|lunch|noon/i.test(description) ? 'noon' :
      /晚上|晚餐|evening|dinner|night/i.test(description) ? 'evening' : null
      
    // Find location context
    const locationContext = 
      /餐廳|飯店|restaurant|diner/i.test(description) ? 'restaurant' :
      /超市|市場|超商|market|store|便利店|全家|7-11/i.test(description) ? 'store' :
      /醫院|診所|hospital|clinic/i.test(description) ? 'medical' :
      /學校|補習班|school|university/i.test(description) ? 'education' : null
      
    return { 
      timeContext,
      locationContext,
      words 
    }
  }
  
  /**
   * Analyzes the expense description to determine the most likely category.
   * @param description - The user-entered description of the expense
   * @returns An object with the suggested category and confidence level
   */
  const classifyExpense = (description: string): ClassifierResult => {
    if (!description.trim()) {
      return { 
        categoryId: 'food', // Default category
        confidence: 0,
        explanation: '未提供描述，使用預設類別。' 
      }
    }

    const lowerDesc = description.toLowerCase()
    
    // First check if we have a user correction for this exact description
    if (userCorrections.value[lowerDesc]) {
      const correctedCategoryId = userCorrections.value[lowerDesc]
      return {
        categoryId: correctedCategoryId,
        confidence: 100,
        explanation: '根據您之前的分類選擇'
      }
    }
    
    // Extract context to improve classification
    const context = extractContext(description)
    
    // Advanced scoring system with weights for different match types
    const scores: Record<string, {
      total: number,
      keywordMatches: string[],
      brandMatches: string[],
      contextMatches: string[]
    }> = {}
    
    // Calculate score for each category based on keyword matches
    for (const [categoryId, categoryData] of Object.entries(categoryKeywords)) {
      scores[categoryId] = {
        total: 0,
        keywordMatches: [],
        brandMatches: [],
        contextMatches: []
      }
      
      // Check for keyword matches (base weight: 1)
      for (const keyword of categoryData.keywords) {
        if (lowerDesc.includes(keyword.toLowerCase())) {
          scores[categoryId].total += 10
          scores[categoryId].keywordMatches.push(keyword)
        }
      }
      
      // Check for brand matches (higher weight: 2)
      for (const brand of categoryData.brands) {
        if (lowerDesc.includes(brand.toLowerCase())) {
          scores[categoryId].total += 20
          scores[categoryId].brandMatches.push(brand)
        }
      }
      
      // Check for contextual matches (higher weight: 1.5)
      for (const contextPhrase of categoryData.context) {
        if (lowerDesc.includes(contextPhrase.toLowerCase())) {
          scores[categoryId].total += 15
          scores[categoryId].contextMatches.push(contextPhrase)
        }
      }
      
      // Bonus for location context
      if (context.locationContext) {
        if (
          (categoryId === 'food' && context.locationContext === 'restaurant') ||
          (categoryId === 'shopping' && context.locationContext === 'store') ||
          (categoryId === 'health' && context.locationContext === 'medical') ||
          (categoryId === 'education' && context.locationContext === 'education')
        ) {
          scores[categoryId].total += 15
        }
      }
      
      // Bonus for time context
      if (context.timeContext && categoryId === 'food') {
        scores[categoryId].total += 10
      }
    }
    
    // Find the categories with scores
    const scoredCategories = Object.entries(scores)
      .map(([id, data]) => ({ 
        id, 
        score: data.total,
        matches: [...data.keywordMatches, ...data.brandMatches, ...data.contextMatches]
      }))
      .filter(cat => cat.score > 0)
      .sort((a, b) => b.score - a.score)
    
    // No matches found
    if (scoredCategories.length === 0) {
      return {
        categoryId: 'shopping', // Changed default to shopping for unknown items
        confidence: 0,
        explanation: '無法準確識別類別，建議手動選擇。',
        possibleCategories: Object.keys(categoryKeywords).map(id => ({ 
          id, 
          name: getCategoryName(id),
          score: 0 
        }))
      }
    }
    
    const bestCategory = scoredCategories[0]
    
    // Calculate confidence (scale the score to 0-100)
    const maxPossibleScore = 50 // Approximate maximum reasonable score
    const confidence = Math.min(Math.round((bestCategory.score / maxPossibleScore) * 100), 100)
    
    // Get top 3 possible alternatives
    const possibleCategories = scoredCategories
      .slice(0, 3)
      .map(cat => ({
        id: cat.id,
        name: getCategoryName(cat.id),
        score: cat.score
      }))
    
    // If we have low confidence, add more alternatives
    const lowConfidence = confidence < 70
    
    let explanation = bestCategory.matches.length > 0 
      ? `匹配關鍵詞: ${bestCategory.matches.join(', ')}`
      : '根據描述內容分析。'
        
    // Add confidence level to explanation
    if (confidence > 90) {
      explanation += '（高度確信）'
    } else if (confidence > 70) {
      explanation += '（中度確信）'
    } else {
      explanation += '（較低確信，建議確認）'
    }
    
    return {
      categoryId: bestCategory.id,
      confidence: confidence,
      explanation: explanation,
      possibleCategories: lowConfidence ? possibleCategories : undefined
    }
  }
  
  /**
   * Remember user corrections to improve future classifications
   * @param description - The expense description
   * @param categoryId - The category ID chosen by the user
   */
  const rememberCorrection = (description: string, categoryId: string) => {
    if (!description || !categoryId) return
    
    // Store the correction
    userCorrections.value[description.toLowerCase()] = categoryId
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('expenseClassifierCorrections', JSON.stringify(userCorrections.value))
    } catch (e) {
      console.error('Failed to save classifier corrections:', e)
    }
  }

  /**
   * Gets category name from its ID
   */
  const getCategoryName = (categoryId: string): string => {
    const category = store.categories.find(c => c.id === categoryId)
    return category ? category.name : categoryId
  }

  /**
   * Gets all available expense categories
   */
  const getExpenseCategories = () => {
    return store.categories.filter(c => c.type === 'expense')
  }

  return {
    classifyExpense,
    getExpenseCategories,
    rememberCorrection
  }
} 