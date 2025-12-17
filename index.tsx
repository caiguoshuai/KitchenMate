import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  ChefHat, 
  Calendar, 
  Refrigerator, 
  ShoppingCart, 
  Code, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Settings, 
  Globe,
  ArrowRight,
  Database,
  Server,
  Layout,
  X,
  Minus,
  Users,
  Edit2,
  Utensils,
  Play,
  Save,
  MoreVertical,
  Leaf,
  Image as ImageIcon,
  Wand2,
  ArrowDown,
  Search,
  User,
  LogOut,
  Lock,
  UserCircle
} from 'lucide-react';

// --- TYPES (V2 Mental Model) ---

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  isSeasoning: boolean;
}

interface Recipe {
  id: string;
  title: string;
  image: string;
  baseServings: number;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
}

// V2: MealItem is a single recipe within a meal slot
interface MealItem {
  id: string;
  recipeId: string;
  multiplier: number;
}

// V2: MealSlot represents "2025-12-16 Lunch" containing multiple items
interface MealSlot {
  id: string;
  date: string; // YYYY-MM-DD
  type: 'breakfast' | 'lunch' | 'dinner';
  items: MealItem[]; 
}

interface InventoryItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  expirationDate: string;
  status: 'normal' | 'expiring' | 'expired';
}

interface ShoppingListItem {
  id: string;
  name: string;
  needed: number;
  unit: string;
  checked: boolean;
  notes?: string;
}

interface UserProfile {
  username: string;
  name: string;
  avatar: string;
  joinedDate: string;
}

// --- MOCK DATA ---

const INITIAL_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Kung Pao Chicken',
    image: 'https://images.unsplash.com/photo-1525755617299-7a88784337d5?auto=format&fit=crop&w=800&q=80',
    baseServings: 2,
    ingredients: [
      { name: 'Chicken Breast', amount: 300, unit: 'g', isSeasoning: false },
      { name: 'Peanuts', amount: 50, unit: 'g', isSeasoning: false },
      { name: 'Dried Chili', amount: 10, unit: 'g', isSeasoning: true },
      { name: 'Scallion', amount: 2, unit: 'stalks', isSeasoning: false }
    ],
    steps: ['Dice chicken', 'Fry peanuts', 'Stir fry everything'],
    tags: ['Chinese', 'Spicy']
  },
  {
    id: '2',
    title: 'Tomato Pasta',
    image: 'https://images.unsplash.com/photo-1626844131082-256783844137?auto=format&fit=crop&w=800&q=80',
    baseServings: 1,
    ingredients: [
      { name: 'Pasta', amount: 150, unit: 'g', isSeasoning: false },
      { name: 'Tomato Sauce', amount: 200, unit: 'g', isSeasoning: false },
      { name: 'Basil', amount: 5, unit: 'leaves', isSeasoning: true }
    ],
    steps: ['Boil water', 'Cook pasta', 'Mix sauce'],
    tags: ['Western', 'Quick']
  },
  {
    id: '3',
    title: 'Steamed Rice',
    image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80',
    baseServings: 2,
    ingredients: [
      { name: 'Rice', amount: 200, unit: 'g', isSeasoning: false },
      { name: 'Water', amount: 300, unit: 'ml', isSeasoning: true }
    ],
    steps: ['Wash rice', 'Cook in rice cooker'],
    tags: ['Basic', 'Side']
  }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Chicken Breast', amount: 500, unit: 'g', expirationDate: '2023-11-20', status: 'expiring' },
  { id: '2', name: 'Pasta', amount: 500, unit: 'g', expirationDate: '2024-05-01', status: 'normal' },
  { id: '3', name: 'Eggs', amount: 4, unit: 'pcs', expirationDate: '2023-10-01', status: 'expired' },
  { id: '4', name: 'Rice', amount: 2000, unit: 'g', expirationDate: '2024-12-01', status: 'normal' }
];

// --- I18N ---

const TRANSLATIONS = {
  en: {
    titles: {
      recipes: 'Recipes',
      planner: 'Meal Planner',
      inventory: 'Inventory',
      shop: 'Shopping List',
      architecture: 'Architecture',
      addRecipe: 'Add Recipe',
      editRecipe: 'Edit Recipe',
      login: 'Login',
      profile: 'My Profile'
    },
    actions: {
      add: 'Add',
      calculate: 'Generate List',
      finishShopping: 'Finish Shopping',
      check: 'Check Stock',
      settings: 'Settings',
      save: 'Save',
      cancel: 'Cancel',
      cook: 'Cook This Meal',
      confirmCook: 'Confirm & Deduct Inventory',
      edit: 'Edit',
      delete: 'Delete',
      smartPaste: 'Smart Paste',
      parse: 'Parse',
      addRow: 'Add Row',
      login: 'Sign In',
      logout: 'Sign Out',
      changePassword: 'Change Password'
    },
    labels: {
      servings: 'Servings',
      multiplier: 'Multiplier',
      ingredients: 'Ingredients',
      expiring: 'Expiring Soon',
      expired: 'Expired',
      normal: 'Good',
      selectRecipe: 'Select Recipe',
      consumption: 'Ingredients to Consume',
      consumptionHint: 'Adjust actual used amounts before deducting.',
      pasteHint: 'Paste ingredients (e.g., "200g Chicken"). One per line.',
      steps: 'Steps',
      recipeTitle: 'Recipe Title',
      imageUrl: 'Image URL',
      stepHint: 'Enter step instruction...',
      username: 'Username',
      password: 'Password',
      welcome: 'Welcome back',
      memberSince: 'Member since'
    },
    specs: {
      title: 'Step 1: V2 Database Schema (Multi-Recipe Support)',
      logicTitle: 'Step 2: Backend Logic',
      frontendTitle: 'Step 3: Frontend Components',
      desc: 'Updated to support multiple recipes per meal slot.',
    }
  },
  zh: {
    titles: {
      recipes: '食谱管理',
      planner: '膳食计划',
      inventory: '库存管理',
      shop: '智能购物清单',
      architecture: '架构设计',
      addRecipe: '添加食谱',
      editRecipe: '编辑食谱',
      login: '用户登录',
      profile: '个人中心'
    },
    actions: {
      add: '添加',
      calculate: '生成清单',
      finishShopping: '完成购物',
      check: '检查库存',
      settings: '设置',
      save: '保存',
      cancel: '取消',
      cook: '烹饪此餐',
      confirmCook: '确认并扣减库存',
      edit: '编辑',
      delete: '删除',
      smartPaste: '智能粘贴',
      parse: '解析',
      addRow: '添加一行',
      login: '登录',
      logout: '退出登录',
      changePassword: '修改密码'
    },
    labels: {
      servings: '份量',
      multiplier: '倍数',
      ingredients: '食材',
      expiring: '即将过期',
      expired: '已过期',
      normal: '正常',
      selectRecipe: '选择食谱',
      consumption: '消耗食材',
      consumptionHint: '扣减前可调整实际使用量。',
      pasteHint: '粘贴食材列表 (例如 "200g 鸡胸肉")。每行一项。',
      steps: '步骤',
      recipeTitle: '食谱名称',
      imageUrl: '图片链接',
      stepHint: '输入步骤说明...',
      username: '用户名',
      password: '密码',
      welcome: '欢迎回来',
      memberSince: '注册时间'
    },
    specs: {
      title: '步骤 1: V2 数据库模型 (多食谱支持)',
      logicTitle: '步骤 2: 后端逻辑',
      frontendTitle: '步骤 3: 前端组件',
      desc: '更新模型以支持单餐多个食谱。',
    }
  }
};

// --- HELPER FUNCTIONS ---

const getStatusColor = (status: string) => {
  switch (status) {
    case 'expired': return 'bg-red-100 text-red-800 border-red-200';
    case 'expiring': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-green-100 text-green-800 border-green-200';
  }
};

const smartParseIngredients = (text: string): Ingredient[] => {
  return text.split('\n').filter(line => line.trim()).map(line => {
    // Regex: Start with number (int/float), optional space, optional unit (word), space, rest is name
    // Matches: "200g Chicken", "200 g Chicken", "2 Chicken", "1.5 kg Beef"
    const regex = /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.*)$/;
    const match = line.trim().match(regex);
    
    if (match) {
      return {
        name: match[3].trim(),
        amount: parseFloat(match[1]),
        unit: match[2] || 'pcs', // Default unit if strictly number + name
        isSeasoning: false
      };
    }
    // Fallback for lines that don't match strict pattern
    return { name: line.trim(), amount: 1, unit: 'pcs', isSeasoning: false };
  });
};

// --- COMPONENTS ---

// Login View
const LoginView = ({ onLogin, lang }: { onLogin: () => void, lang: 'en' | 'zh' }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const t = TRANSLATIONS[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'root' && password === 'root') {
      onLogin();
    } else {
      setError(lang === 'zh' ? '用户名或密码错误' : 'Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full">
            <ChefHat className="w-10 h-10 text-orange-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">KitchenMate</h2>
        <p className="text-center text-gray-500 mb-8">{t.labels.welcome}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.labels.username}</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="root"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t.labels.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="password"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="root"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-95"
          >
            {t.actions.login}
          </button>
        </form>
      </div>
    </div>
  );
};

// Profile View
const ProfileView = ({ user, onLogout, lang }: { user: UserProfile, onLogout: () => void, lang: 'en' | 'zh' }) => {
  const t = TRANSLATIONS[lang];
  
  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mb-4 border-4 border-white shadow-lg">
          <UserCircle className="w-16 h-16 text-indigo-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
        <p className="text-gray-500 text-sm font-mono">@{user.username}</p>
        <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
           <Calendar className="w-3 h-3" /> {t.labels.memberSince}: {user.joinedDate}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group">
           <div className="flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Lock className="w-5 h-5" /></div>
             <span className="font-medium text-gray-700">{t.actions.changePassword}</span>
           </div>
           <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
        </div>
        
        <div className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group">
           <div className="flex items-center gap-3">
             <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Globe className="w-5 h-5" /></div>
             <span className="font-medium text-gray-700">Language / 语言</span>
           </div>
           <span className="text-sm text-gray-400">{lang === 'en' ? 'English' : '中文'}</span>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full bg-white border border-red-200 text-red-600 font-bold py-3.5 rounded-xl shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" />
        {t.actions.logout}
      </button>
    </div>
  );
};

// 1. Architecture View
const ArchitectureView = ({ lang }: { lang: 'en' | 'zh' }) => {
  const t = TRANSLATIONS[lang];
  
  const goStructs = `
package models

// --- Backend Logic: UpdateRecipe (Full Replacement Strategy) ---

// PUT /api/recipes/:id
func (h *RecipeHandler) UpdateRecipe(c *gin.Context) {
    var payload RecipeInput
    if err := c.BindJSON(&payload); err != nil {
        c.AbortWithStatus(400)
        return
    }

    // 1. Start Transaction
    tx := h.db.Begin()

    // 2. Update Basic Fields (Title, Servings, etc.)
    if err := tx.Model(&Recipe{}).Where("id = ?", id).Updates(payload).Error; err != nil {
        tx.Rollback()
        return
    }

    // 3. Ingredients Strategy: FULL REPLACE
    // It is cleaner to delete all old ingredients for this recipe and insert new ones
    // rather than complex diffing logic.
    if err := tx.Where("recipe_id = ?", id).Delete(&Ingredient{}).Error; err != nil {
        tx.Rollback()
        return
    }
    
    // 4. Bulk Insert New Ingredients
    for _, ing := range payload.Ingredients {
        ing.RecipeID = id
        if err := tx.Create(&ing).Error; err != nil {
             tx.Rollback()
             return
        }
    }
    
    // 5. Commit
    tx.Commit()
}
`;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Database className="w-6 h-6 text-indigo-600" />
          {t.specs.logicTitle}
        </h2>
        <p className="text-gray-600 mb-4">{t.specs.desc}</p>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-blue-400">
            {goStructs}
          </pre>
        </div>
      </div>
    </div>
  );
};

// 2. Recipe Form (Add/Edit)
const RecipeForm = ({ 
  initialData, 
  onSave, 
  onCancel, 
  lang 
}: { 
  initialData?: Recipe, 
  onSave: (r: Recipe) => void, 
  onCancel: () => void,
  lang: 'en' | 'zh'
}) => {
  const t = TRANSLATIONS[lang];
  
  // Form State
  const [formData, setFormData] = useState<Recipe>(initialData || {
    id: Math.random().toString(),
    title: '',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
    baseServings: 2,
    ingredients: [],
    steps: [],
    tags: []
  });

  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState('');

  // Ingredient Helpers
  const addIngredientRow = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: 1, unit: 'pcs', isSeasoning: false }]
    }));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    const newIngs = [...formData.ingredients];
    newIngs[index] = { ...newIngs[index], [field]: value };
    setFormData({ ...formData, ingredients: newIngs });
  };

  const removeIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleSmartParse = () => {
    const parsed = smartParseIngredients(pasteText);
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ...parsed]
    }));
    setPasteText('');
    setPasteMode(false);
  };

  // Steps Helpers
  const addStep = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      setFormData(prev => ({
        ...prev,
        steps: [...prev.steps, e.currentTarget.value.trim()]
      }));
      e.currentTarget.value = '';
    }
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
        <h2 className="font-bold text-lg flex items-center gap-2">
          {initialData ? <Edit2 className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
          {initialData ? t.titles.editRecipe : t.titles.addRecipe}
        </h2>
        <button onClick={onCancel}><X className="w-5 h-5 hover:text-indigo-200"/></button>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t.labels.recipeTitle}</label>
            <input 
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Kung Pao Chicken"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t.labels.servings}</label>
            <input 
              type="number"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.baseServings}
              onChange={e => setFormData({...formData, baseServings: parseFloat(e.target.value)})}
            />
          </div>
        </div>

        {/* Image Preview & URL */}
        <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
           <img src={formData.image} alt="Preview" className="w-16 h-16 rounded object-cover bg-gray-200" />
           <div className="flex-1 space-y-1">
             <label className="text-xs font-medium text-gray-500 flex items-center gap-1"><ImageIcon className="w-3 h-3"/> {t.labels.imageUrl}</label>
             <input 
                className="w-full text-sm border-b border-gray-300 bg-transparent py-1 focus:border-indigo-500 outline-none"
                value={formData.image}
                onChange={e => setFormData({...formData, image: e.target.value})}
             />
           </div>
        </div>

        {/* Ingredients Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="font-bold text-gray-800">{t.labels.ingredients}</label>
            <div className="flex gap-2">
              <button 
                onClick={() => setPasteMode(!pasteMode)}
                className={`text-xs px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors ${pasteMode ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
              >
                <Wand2 className="w-3 h-3" /> {t.actions.smartPaste}
              </button>
            </div>
          </div>

          {pasteMode ? (
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-4 animate-in fade-in">
              <textarea 
                className="w-full h-32 p-3 rounded-lg border border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={t.labels.pasteHint}
                value={pasteText}
                onChange={e => setPasteText(e.target.value)}
              />
              <div className="flex justify-end mt-2">
                <button 
                  onClick={handleSmartParse}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  {t.actions.parse}
                </button>
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            {formData.ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-2 group">
                {/* Name */}
                <input 
                  className="flex-[2] border border-gray-200 bg-gray-50 rounded-lg p-2 text-sm focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                  placeholder="Name"
                  value={ing.name}
                  onChange={e => updateIngredient(i, 'name', e.target.value)}
                />
                {/* Amount */}
                <input 
                  type="number"
                  className="flex-[0.5] w-16 border border-gray-200 bg-gray-50 rounded-lg p-2 text-sm text-center focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                  value={ing.amount}
                  onChange={e => updateIngredient(i, 'amount', parseFloat(e.target.value))}
                />
                {/* Unit */}
                <input 
                   className="flex-[0.5] w-16 border border-gray-200 bg-gray-50 rounded-lg p-2 text-sm text-center focus:bg-white focus:border-indigo-500 outline-none transition-colors"
                   value={ing.unit}
                   onChange={e => updateIngredient(i, 'unit', e.target.value)}
                />
                {/* Seasoning Toggle */}
                <button 
                  onClick={() => updateIngredient(i, 'isSeasoning', !ing.isSeasoning)}
                  className={`p-2 rounded-lg transition-colors ${ing.isSeasoning ? 'bg-green-100 text-green-700' : 'text-gray-300 hover:bg-gray-100'}`}
                  title="Is Seasoning?"
                >
                  <Leaf className="w-4 h-4" />
                </button>
                {/* Delete */}
                <button 
                  onClick={() => removeIngredient(i)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button 
              onClick={addIngredientRow}
              className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 text-sm hover:border-indigo-400 hover:text-indigo-600 transition-colors flex justify-center items-center gap-2"
            >
              <Plus className="w-4 h-4" /> {t.actions.addRow}
            </button>
          </div>
        </div>

        {/* Steps Section */}
        <div>
           <label className="font-bold text-gray-800 block mb-3">{t.labels.steps}</label>
           <div className="space-y-2">
             {formData.steps.map((step, i) => (
               <div key={i} className="flex gap-3 items-start group">
                 <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 flex-shrink-0">
                   {i + 1}
                 </span>
                 <p className="flex-1 text-sm text-gray-700 py-1">{step}</p>
                 <button onClick={() => removeStep(i)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                   <X className="w-4 h-4" />
                 </button>
               </div>
             ))}
             <div className="flex gap-3 items-center">
                <span className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center text-xs text-gray-300 flex-shrink-0">
                  {formData.steps.length + 1}
                </span>
                <input 
                  className="flex-1 border-b border-gray-200 py-2 text-sm focus:border-indigo-500 outline-none"
                  placeholder={t.labels.stepHint}
                  onKeyDown={addStep}
                />
             </div>
           </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3">
        <button 
          onClick={onCancel}
          className="px-6 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-200 transition-colors"
        >
          {t.actions.cancel}
        </button>
        <button 
          onClick={() => onSave(formData)}
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-transform active:scale-95 flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> {t.actions.save}
        </button>
      </div>
    </div>
  );
};

// 3. Recipe Management (Parent View)
const RecipeView = ({ 
  recipes, 
  onDelete,
  onSave,
  lang 
}: { 
  recipes: Recipe[], 
  onDelete: (id: string) => void,
  onSave: (r: Recipe) => void,
  lang: 'en' | 'zh' 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter recipes based on title, tags, or ingredients
  const filteredRecipes = recipes.filter(r => {
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.tags.some(tag => tag.toLowerCase().includes(q)) ||
      r.ingredients.some(ing => ing.name.toLowerCase().includes(q))
    );
  });

  // If adding or editing, show Form
  if (isCreating || editingId) {
    const initialData = editingId ? recipes.find(r => r.id === editingId) : undefined;
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <RecipeForm 
          initialData={initialData} 
          onSave={(r) => { onSave(r); setIsCreating(false); setEditingId(null); }}
          onCancel={() => { setIsCreating(false); setEditingId(null); }}
          lang={lang}
        />
      </div>
    );
  }

  // Otherwise show List
  return (
    <div className="p-4">
      {/* Search Bar */}
      <div className="mb-6 relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
          placeholder={lang === 'zh' ? "搜索食谱、食材..." : "Search recipes, ingredients..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecipes.map(recipe => (
          <div key={recipe.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 flex flex-col group hover:shadow-md transition-shadow">
            <div className="h-48 overflow-hidden relative">
               <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
               <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => setEditingId(recipe.id)}
                    className="p-2 bg-white/90 rounded-full text-gray-700 hover:text-indigo-600 shadow-sm backdrop-blur-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(recipe.id)}
                    className="p-2 bg-white/90 rounded-full text-gray-700 hover:text-red-600 shadow-sm backdrop-blur-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
               </div>
               <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                 <h3 className="text-white font-bold text-lg">{recipe.title}</h3>
                 <div className="flex gap-2 mt-1">
                   {recipe.tags.map(tag => (
                     <span key={tag} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">{tag}</span>
                   ))}
                 </div>
               </div>
            </div>
            <div className="p-4 flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">{TRANSLATIONS[lang].labels.servings}: {recipe.baseServings}</span>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                {recipe.ingredients.slice(0, 3).map((ing, i) => (
                  <li key={i}>• {ing.amount}{ing.unit} {ing.name}</li>
                ))}
                {recipe.ingredients.length > 3 && <li>...</li>}
              </ul>
            </div>
          </div>
        ))}
        <button 
          onClick={() => setIsCreating(true)}
          className="flex flex-col items-center justify-center h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors bg-gray-50 hover:bg-indigo-50"
        >
          <Plus className="w-8 h-8 mb-2" />
          <span className="font-medium">{TRANSLATIONS[lang].actions.add}</span>
        </button>
      </div>
    </div>
  );
};

// 3. Meal Planner (V2: Multi-Recipe + Cook Workflow)
const PlannerView = ({ 
  slots, 
  recipes, 
  onAddItem, 
  onRemoveItem,
  onUpdateMultiplier,
  onCookSlot,
  lang 
}: { 
  slots: MealSlot[], 
  recipes: Recipe[], 
  onAddItem: (date: string, type: string, recipeId: string, multiplier: number) => void,
  onRemoveItem: (slotId: string, itemId: string) => void,
  onUpdateMultiplier: (slotId: string, itemId: string, m: number) => void,
  onCookSlot: (slot: MealSlot) => void,
  lang: 'en' | 'zh'
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{date: string, type: string}>({ date: '', type: '' });
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id || '');
  const [multiplier, setMultiplier] = useState(1);
  const t = TRANSLATIONS[lang];

  // 5 Day View
  const dates = Array.from({length: 5}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });

  const openAddModal = (date: string, type: string) => {
    setModalData({ date, type });
    setSelectedRecipeId(recipes[0]?.id || '');
    setMultiplier(1);
    setModalOpen(true);
  };

  const handleSaveAdd = () => {
    onAddItem(modalData.date, modalData.type, selectedRecipeId, multiplier);
    setModalOpen(false);
  };

  return (
    <div className="p-4 space-y-6">
      {dates.map(date => (
        <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            {date}
          </h3>
          <div className="space-y-4">
            {['breakfast', 'lunch', 'dinner'].map(type => {
              // V2: Find the slot container
              const slot = slots.find(s => s.date === date && s.type === type);
              const hasItems = slot && slot.items.length > 0;

              return (
                <div key={type} className="border border-gray-100 rounded-xl bg-gray-50/50 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{type}</span>
                    <div className="flex gap-2">
                      {hasItems && (
                        <button 
                          onClick={() => onCookSlot(slot!)}
                          className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium hover:bg-orange-200 transition-colors"
                        >
                          <Utensils className="w-3 h-3" />
                          {t.actions.cook}
                        </button>
                      )}
                      <button 
                        onClick={() => openAddModal(date, type)}
                        className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded hover:text-indigo-600 hover:border-indigo-300 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        {t.actions.add}
                      </button>
                    </div>
                  </div>

                  {/* List of Recipes in this Slot */}
                  {!hasItems ? (
                    <div className="text-xs text-gray-400 italic py-2 text-center">Empty</div>
                  ) : (
                    <div className="space-y-2">
                      {slot?.items.map(item => {
                        const recipe = recipes.find(r => r.id === item.recipeId);
                        if (!recipe) return null;
                        return (
                          <div key={item.id} className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img src={recipe.image} className="w-8 h-8 rounded object-cover bg-gray-100" />
                              <div>
                                <div className="text-sm font-medium text-gray-800 leading-tight">{recipe.title}</div>
                                <div className="text-[10px] text-gray-500">
                                  {recipe.baseServings * item.multiplier} {t.labels.servings}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                               <button 
                                onClick={() => onUpdateMultiplier(slot.id, item.id, item.multiplier >= 4 ? 1 : item.multiplier + 0.5)}
                                className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 hover:border-indigo-300 w-8 text-center"
                              >
                                x{item.multiplier}
                              </button>
                              <button 
                                onClick={() => onRemoveItem(slot.id, item.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Add Item Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-4">
             <h3 className="font-bold text-lg mb-4">{t.actions.add} to {modalData.type}</h3>
             
             <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                {recipes.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRecipeId(r.id)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-all ${
                      selectedRecipeId === r.id 
                        ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
                        : 'border-gray-200'
                    }`}
                  >
                    <img src={r.image} className="w-10 h-10 rounded object-cover bg-gray-100" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{r.title}</div>
                    </div>
                    {selectedRecipeId === r.id && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                ))}
             </div>

             <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg mb-4">
                 <span className="text-sm font-medium text-gray-600">{t.labels.multiplier}</span>
                 <div className="flex items-center gap-3">
                   <button onClick={() => setMultiplier(Math.max(1, multiplier - 0.5))} className="p-1 hover:bg-white rounded shadow-sm"><Minus className="w-4 h-4"/></button>
                   <span className="font-bold">{multiplier}</span>
                   <button onClick={() => setMultiplier(Math.min(10, multiplier + 0.5))} className="p-1 hover:bg-white rounded shadow-sm"><Plus className="w-4 h-4"/></button>
                 </div>
             </div>

             <div className="flex gap-3">
               <button onClick={() => setModalOpen(false)} className="flex-1 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">{t.actions.cancel}</button>
               <button onClick={handleSaveAdd} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">{t.actions.save}</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 4. Inventory (Full CRUD)
const InventoryView = ({ 
  inventory, 
  onAdd, 
  onEdit, 
  onDelete, 
  lang 
}: { 
  inventory: InventoryItem[], 
  onAdd: (item: InventoryItem) => void,
  onEdit: (id: string, item: Partial<InventoryItem>) => void,
  onDelete: (id: string) => void,
  lang: 'en' | 'zh'
}) => {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  const t = TRANSLATIONS[lang];

  const handleSave = () => {
    if (isEditing === 'new') {
      onAdd({
        id: Math.random().toString(),
        name: formData.name || 'New Item',
        amount: formData.amount || 1,
        unit: formData.unit || 'pcs',
        status: 'normal',
        expirationDate: '2025-01-01'
      });
    } else if (isEditing) {
      onEdit(isEditing, formData);
    }
    setIsEditing(null);
    setFormData({});
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-20">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="p-4 font-medium">{t.labels.ingredients}</th>
              <th className="p-4 font-medium text-right">{t.labels.servings}</th>
              <th className="p-4 font-medium text-center w-20">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 group">
                <td className="p-4 font-medium text-gray-800">
                  {item.name}
                  <div className={`mt-1 inline-flex text-[10px] px-1.5 rounded border ${getStatusColor(item.status)}`}>
                    {t.labels[item.status]}
                  </div>
                </td>
                <td className="p-4 text-gray-600 text-right">{item.amount} {item.unit}</td>
                <td className="p-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button 
                      onClick={() => { setIsEditing(item.id); setFormData(item); }}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4">
        <button 
          onClick={() => { setIsEditing('new'); setFormData({}); }}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg shadow-indigo-300 hover:bg-indigo-700 transition-transform active:scale-90"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Edit/Add Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl w-full max-w-sm p-4 shadow-xl">
             <h3 className="font-bold mb-4">{isEditing === 'new' ? 'Add Item' : 'Edit Item'}</h3>
             <div className="space-y-3">
               <input 
                 className="w-full border border-gray-300 rounded p-2" 
                 placeholder="Name" 
                 value={formData.name || ''} 
                 onChange={e => setFormData({...formData, name: e.target.value})}
               />
               <div className="flex gap-2">
                 <input 
                   type="number"
                   className="flex-1 border border-gray-300 rounded p-2" 
                   placeholder="Amount" 
                   value={formData.amount || ''} 
                   onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                 />
                 <input 
                   className="w-20 border border-gray-300 rounded p-2" 
                   placeholder="Unit" 
                   value={formData.unit || ''} 
                   onChange={e => setFormData({...formData, unit: e.target.value})}
                 />
               </div>
             </div>
             <div className="flex gap-3 mt-6">
                <button onClick={() => setIsEditing(null)} className="flex-1 py-2 text-gray-500 hover:bg-gray-100 rounded">{t.actions.cancel}</button>
                <button onClick={handleSave} className="flex-1 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">{t.actions.save}</button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

// 5. Shopping List
const ShoppingListView = ({ 
  plans, 
  recipes, 
  inventory, 
  onPurchase,
  lang 
}: { 
  plans: MealSlot[], 
  recipes: Recipe[], 
  inventory: InventoryItem[], 
  onPurchase: (items: ShoppingListItem[]) => void,
  lang: 'en' | 'zh'
}) => {
  const [list, setList] = useState<ShoppingListItem[]>([]);
  const t = TRANSLATIONS[lang];

  const generateList = () => {
    const needed = new Map<string, { amount: number, unit: string }>();

    // V2 Logic: Iterate Slots -> Items -> Ingredients
    plans.forEach(slot => {
      slot.items.forEach(item => {
        const recipe = recipes.find(r => r.id === item.recipeId);
        if (!recipe) return;
        recipe.ingredients.forEach(ing => {
          // Logic: Recipe Base * Item Multiplier
          const amountNeeded = ing.amount * item.multiplier;
          const existing = needed.get(ing.name);
          if (existing) {
            needed.set(ing.name, { amount: existing.amount + amountNeeded, unit: ing.unit });
          } else {
            needed.set(ing.name, { amount: amountNeeded, unit: ing.unit });
          }
        });
      });
    });

    const finalList: ShoppingListItem[] = [];
    needed.forEach((val, key) => {
      const stock = inventory.find(i => i.name === key);
      let required = val.amount;
      let note = undefined;

      if (stock) {
        if (stock.unit === val.unit) {
          required -= stock.amount;
        } else {
          note = `${t.actions.check}: Have ${stock.amount}${stock.unit}`;
        }
      }

      if (required > 0 || note) {
        finalList.push({
          id: Math.random().toString(),
          name: key,
          needed: Math.max(0, required),
          unit: val.unit,
          checked: false,
          notes: note
        });
      }
    });
    setList(finalList);
  };

  const toggleCheck = (id: string) => {
    setList(list.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // Allow user to edit the amount they actually bought
  const updateAmount = (id: string, val: number) => {
    setList(list.map(item => item.id === id ? { ...item, needed: val } : item));
  };

  const handleFinish = () => {
    onPurchase(list.filter(i => i.checked));
    setList(list.filter(i => !i.checked));
  };

  if (list.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center h-[60vh] p-6 text-center">
        <div className="bg-indigo-100 p-4 rounded-full mb-4">
          <ShoppingCart className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{t.titles.shop}</h2>
        <button 
          onClick={generateList}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          {t.actions.calculate}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-gray-800 text-lg">Needs ({list.length})</h2>
        <button onClick={generateList} className="text-indigo-600 text-sm font-medium hover:underline">Refresh</button>
      </div>
      <div className="space-y-3">
        {list.map(item => (
          <div 
            key={item.id} 
            onClick={() => toggleCheck(item.id)}
            className={`flex items-center p-4 rounded-xl border transition-all cursor-pointer ${item.checked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
              {item.checked && <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
              <div className={`font-medium ${item.checked ? 'text-green-800 line-through' : 'text-gray-800'}`}>{item.name}</div>
              
              {/* Editable Amount Input */}
              <div className="flex items-center gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                 <input 
                   type="number"
                   min="0"
                   step="any"
                   className="w-24 border border-gray-300 rounded px-2 py-1 text-sm focus:border-indigo-500 outline-none bg-white/80"
                   value={item.needed}
                   onChange={(e) => updateAmount(item.id, parseFloat(e.target.value) || 0)}
                 />
                 <span className="text-xs text-gray-500">{item.unit}</span>
              </div>
              
              {item.notes && <div className="text-xs text-orange-500 mt-1">{item.notes}</div>}
            </div>
          </div>
        ))}
      </div>
      {list.some(i => i.checked) && (
        <div className="fixed bottom-20 left-4 right-4">
          <button onClick={handleFinish} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg flex items-center justify-center gap-2">
            {t.actions.finishShopping} <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

// --- APP ---

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'recipes' | 'inventory' | 'shop' | 'specs' | 'profile'>('plan');
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  
  // User State
  const [user, setUser] = useState<UserProfile>({
    username: 'root',
    name: 'Root User',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    joinedDate: '2025-01-01'
  });

  // V2 STATE
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  
  // V2: MealSlots (Flat list of slots that have items)
  const [slots, setSlots] = useState<MealSlot[]>([
    { 
      id: '101', 
      date: new Date().toISOString().split('T')[0], 
      type: 'dinner', 
      items: [
        { id: 'item1', recipeId: '1', multiplier: 2 },
        { id: 'item2', recipeId: '3', multiplier: 2 } // Rice
      ] 
    }
  ]);

  // Cook Modal State
  const [cookModal, setCookModal] = useState<{ isOpen: boolean, slot: MealSlot | null, consumption: Record<string, number> }>({
    isOpen: false, slot: null, consumption: {}
  });

  // --- ACTIONS ---

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('plan'); // Reset tab
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    setRecipes(prev => {
      const idx = prev.findIndex(r => r.id === recipe.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = recipe;
        return updated;
      }
      return [...prev, recipe];
    });
  };

  const addItemToSlot = (date: string, type: string, recipeId: string, multiplier: number) => {
    setSlots(prev => {
      const existingIdx = prev.findIndex(s => s.date === date && s.type === type);
      const newItem: MealItem = { id: Math.random().toString(), recipeId, multiplier };
      
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], items: [...updated[existingIdx].items, newItem] };
        return updated;
      } else {
        return [...prev, { id: Math.random().toString(), date, type: type as any, items: [newItem] }];
      }
    });
  };

  const removeItemFromSlot = (slotId: string, itemId: string) => {
    setSlots(prev => prev.map(s => {
      if (s.id !== slotId) return s;
      return { ...s, items: s.items.filter(i => i.id !== itemId) };
    }).filter(s => s.items.length > 0)); // Remove empty slots
  };

  const updateItemMultiplier = (slotId: string, itemId: string, m: number) => {
    setSlots(prev => prev.map(s => {
      if (s.id !== slotId) return s;
      return { ...s, items: s.items.map(i => i.id === itemId ? { ...i, multiplier: m } : i) };
    }));
  };

  // NEW: Handle Shopping List -> Inventory
  const handlePurchase = (items: ShoppingListItem[]) => {
    setInventory(prev => {
      const updated = [...prev];
      items.forEach(shopItem => {
         // Find existing item by name AND unit to update amount
         const idx = updated.findIndex(i => i.name === shopItem.name && i.unit === shopItem.unit);
         if (idx >= 0) {
            // Update existing
            updated[idx] = {
              ...updated[idx],
              amount: updated[idx].amount + shopItem.needed, // Add bought amount
              status: 'normal', // Reset status
              expirationDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] // +7 days default
            };
         } else {
            // Create new
            updated.push({
               id: Math.random().toString(),
               name: shopItem.name,
               amount: shopItem.needed,
               unit: shopItem.unit,
               status: 'normal',
               expirationDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
            });
         }
      });
      return updated;
    });
    alert(lang === 'zh' ? `已将 ${items.length} 项物品加入库存！` : `Added ${items.length} items to inventory!`);
  };

  // COOK LOGIC (Updated to remove 0 amount items)
  const openCookModal = (slot: MealSlot) => {
    // 1. Calculate Consumption
    const totalNeeds: Record<string, number> = {};
    slot.items.forEach(item => {
      const r = recipes.find(rc => rc.id === item.recipeId);
      if(r) {
        r.ingredients.forEach(ing => {
          totalNeeds[ing.name] = (totalNeeds[ing.name] || 0) + (ing.amount * item.multiplier);
        });
      }
    });
    setCookModal({ isOpen: true, slot, consumption: totalNeeds });
  };

  const confirmCook = () => {
    // 2. Deduct Inventory
    setInventory(prev => prev.map(inv => {
      const consumedAmount = cookModal.consumption[inv.name];
      if (consumedAmount) {
        return { ...inv, amount: Math.max(0, inv.amount - consumedAmount) };
      }
      return inv;
    }).filter(inv => inv.amount > 0)); // AUTOMATICALLY REMOVE ZERO AMOUNT ITEMS
    
    setCookModal({ isOpen: false, slot: null, consumption: {} });
    alert(lang === 'zh' ? "烹饪完成！库存已更新。" : "Cooked! Inventory updated.");
  };

  const t = TRANSLATIONS[lang];

  // --- AUTH CHECK ---
  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} lang={lang} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg"><ChefHat className="w-5 h-5 text-white" /></div>
          <h1 className="font-bold text-lg tracking-tight">KitchenMate V2</h1>
        </div>
        <div className="flex gap-3">
           <button onClick={() => setLang(l => l === 'en' ? 'zh' : 'en')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
             <span className="text-xs font-bold text-gray-600">{lang.toUpperCase()}</span>
           </button>
           <button 
             onClick={() => setActiveTab('profile')} 
             className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600'}`}
           >
             <User className="w-5 h-5" />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto">
        {activeTab === 'recipes' && <RecipeView 
            recipes={recipes} 
            lang={lang} 
            onDelete={(id) => setRecipes(r => r.filter(x => x.id !== id))} 
            onSave={handleSaveRecipe}
        />}
        {activeTab === 'plan' && <PlannerView 
            slots={slots} recipes={recipes} 
            onAddItem={addItemToSlot} onRemoveItem={removeItemFromSlot} onUpdateMultiplier={updateItemMultiplier} onCookSlot={openCookModal}
            lang={lang} 
        />}
        {activeTab === 'inventory' && <InventoryView 
          inventory={inventory} lang={lang} 
          onAdd={(i) => setInventory([...inventory, i])}
          // Updated: Filter 0 amount on manual edit
          onEdit={(id, data) => setInventory(inventory.map(i => i.id === id ? {...i, ...data} : i).filter(i => i.amount > 0))}
          onDelete={(id) => setInventory(inventory.filter(i => i.id !== id))}
        />}
        {activeTab === 'shop' && <ShoppingListView plans={slots} recipes={recipes} inventory={inventory} onPurchase={handlePurchase} lang={lang} />}
        {activeTab === 'specs' && <ArchitectureView lang={lang} />}
        {activeTab === 'profile' && <ProfileView user={user} onLogout={handleLogout} lang={lang} />}
      </main>

      {/* Cook Consumption Modal */}
      {cookModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl w-full max-w-sm p-4 shadow-xl">
             <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{t.labels.consumption}</h3>
                <button onClick={() => setCookModal({...cookModal, isOpen: false})}><X className="w-5 h-5 text-gray-400"/></button>
             </div>
             <p className="text-xs text-gray-500 mb-4">{t.labels.consumptionHint}</p>
             
             <div className="max-h-60 overflow-y-auto space-y-3 mb-6 bg-gray-50 p-3 rounded-lg">
                {Object.entries(cookModal.consumption).map(([name, amount]) => {
                  const unit = recipes.flatMap(r => r.ingredients).find(i => i.name === name)?.unit || '';
                  return (
                    <div key={name} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{name}</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          className="w-16 border rounded p-1 text-right text-sm"
                          value={amount}
                          onChange={(e) => setCookModal({
                            ...cookModal,
                            consumption: { ...cookModal.consumption, [name]: parseFloat(e.target.value) || 0 }
                          })}
                        />
                        <span className="text-xs text-gray-500 w-8">{unit}</span>
                      </div>
                    </div>
                  );
                })}
             </div>
             
             <button onClick={confirmCook} className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 flex justify-center items-center gap-2">
               <Check className="w-5 h-5" /> {t.actions.confirmCook}
             </button>
           </div>
        </div>
      )}

      {/* Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
        <div className="max-w-3xl mx-auto flex justify-around">
          {[
            { id: 'recipes', icon: ChefHat, label: t.titles.recipes },
            { id: 'plan', icon: Calendar, label: t.titles.planner },
            { id: 'shop', icon: ShoppingCart, label: t.titles.shop },
            { id: 'inventory', icon: Refrigerator, label: t.titles.inventory },
            { id: 'specs', icon: Code, label: t.titles.architecture },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex flex-col items-center py-3 px-1 w-full transition-colors ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <item.icon className={`w-6 h-6 mb-1 ${activeTab === item.id ? 'fill-current opacity-20' : ''}`} strokeWidth={activeTab === item.id ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

// --- BOOTSTRAP ---
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

export default App;